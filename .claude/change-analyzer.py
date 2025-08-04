#!/usr/bin/env python3
"""
CChorus Change Analyzer
Standalone utility for analyzing file changes and recommending micro-agent routing.
"""

import os
import sys
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

@dataclass
class ChangeAnalysis:
    """Analysis result for a batch of file changes."""
    total_changes: int
    file_types: Dict[str, int]
    priorities: Dict[str, int]
    agent_recommendations: Dict[str, List[str]]
    workflow_suggestion: str
    estimated_tokens: int
    parallel_capable: bool

class ChangeAnalyzer:
    """Analyzes file changes and provides micro-agent routing recommendations."""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.agent_token_estimates = {
            'readme-updater': 1500,
            'api-documenter': 1800,
            'component-documenter': 1600,
            'backlog-manager': 1200,
            'changelog-updater': 1000,
            'file-change-analyzer': 800
        }
    
    def analyze_files(self, file_paths: List[str]) -> ChangeAnalysis:
        """Analyze a list of changed files and provide routing recommendations."""
        file_types = {}
        priorities = {}
        agent_work = {}
        
        for file_path in file_paths:
            file_info = self._analyze_single_file(file_path)
            if not file_info:
                continue
            
            file_type = file_info['type']
            priority = file_info['priority']
            agents = file_info['agents']
            
            # Count file types
            file_types[file_type] = file_types.get(file_type, 0) + 1
            priorities[priority] = priorities.get(priority, 0) + 1
            
            # Group by agents
            for agent in agents:
                if agent not in agent_work:
                    agent_work[agent] = []
                agent_work[agent].append(file_path)
        
        # Determine workflow and token estimates
        workflow = self._recommend_workflow(agent_work, priorities)
        tokens = self._estimate_tokens(agent_work)
        parallel = len(agent_work) > 1
        
        return ChangeAnalysis(
            total_changes=len(file_paths),
            file_types=file_types,
            priorities=priorities,
            agent_recommendations=agent_work,
            workflow_suggestion=workflow,
            estimated_tokens=tokens,
            parallel_capable=parallel
        )
    
    def _analyze_single_file(self, file_path: str) -> Optional[Dict]:
        """Analyze a single file and return classification info."""
        path = Path(file_path)
        path_str = str(path)
        
        # Component files
        if ('src/components/' in path_str and 
            path.suffix in ['.tsx', '.ts', '.jsx', '.js']):
            return {
                'type': 'component',
                'priority': 'high',
                'agents': ['component-documenter', 'readme-updater']
            }
        
        # API files
        if (path.name == 'server.js' or 
            ('src/api/' in path_str and path.suffix in ['.js', '.ts'])):
            return {
                'type': 'api',
                'priority': 'high', 
                'agents': ['api-documenter', 'readme-updater']
            }
        
        # Agent files
        if '.claude/agents/' in path_str and path.suffix == '.md':
            return {
                'type': 'agent',
                'priority': 'medium',
                'agents': ['file-change-analyzer']
            }
        
        # Command files
        if '.claude/commands/' in path_str and path.suffix == '.md':
            return {
                'type': 'command',
                'priority': 'medium',
                'agents': ['file-change-analyzer']
            }
        
        # Special documentation files
        if path.name == 'BACKLOG.md':
            return {
                'type': 'backlog',
                'priority': 'medium',
                'agents': ['backlog-manager']
            }
        elif path.name == 'CHANGELOG.md':
            return {
                'type': 'changelog',
                'priority': 'low',
                'agents': ['changelog-updater']
            }
        elif path.name in ['README.md', 'CLAUDE.md']:
            return {
                'type': 'doc',
                'priority': 'high',
                'agents': ['readme-updater']
            }
        
        # Configuration files
        if path.name in ['package.json', 'tsconfig.json']:
            return {
                'type': 'config',
                'priority': 'medium',
                'agents': ['readme-updater']
            }
        
        return None
    
    def _recommend_workflow(self, agent_work: Dict[str, List[str]], priorities: Dict[str, int]) -> str:
        """Recommend the best workflow for the changes."""
        num_agents = len(agent_work)
        has_high_priority = priorities.get('high', 0) > 0
        
        if num_agents == 0:
            return "No documentation changes needed"
        elif num_agents == 1:
            agent = list(agent_work.keys())[0]
            return f"claude /microagent --agent {agent}"
        elif has_high_priority:
            return "claude /docsync --priority high"
        else:
            return "claude /microagent"
    
    def _estimate_tokens(self, agent_work: Dict[str, List[str]]) -> int:
        """Estimate total token usage for the changes."""
        total = 0
        for agent, files in agent_work.items():
            base_tokens = self.agent_token_estimates.get(agent, 1500)
            # Add tokens based on number of files
            file_tokens = min(len(files) * 200, base_tokens * 0.5)
            total += base_tokens + file_tokens
        
        return int(total)
    
    def generate_report(self, analysis: ChangeAnalysis) -> str:
        """Generate a human-readable analysis report."""
        report = []
        report.append("🧠 CChorus Change Analysis Report")
        report.append("=" * 40)
        report.append(f"📊 Total Changes: {analysis.total_changes}")
        report.append("")
        
        # File types breakdown
        report.append("📁 File Types:")
        for file_type, count in analysis.file_types.items():
            report.append(f"  • {file_type}: {count} files")
        report.append("")
        
        # Priority breakdown
        report.append("⚡ Priority Levels:")
        for priority, count in analysis.priorities.items():
            report.append(f"  • {priority}: {count} files")
        report.append("")
        
        # Agent recommendations
        report.append("🤖 Recommended Agents:")
        for agent, files in analysis.agent_recommendations.items():
            report.append(f"  • {agent}: {len(files)} files")
        report.append("")
        
        # Workflow suggestion
        report.append("🚀 Suggested Workflow:")
        report.append(f"  {analysis.workflow_suggestion}")
        report.append("")
        
        # Performance estimates
        report.append("📈 Performance Estimates:")
        report.append(f"  • Estimated tokens: ~{analysis.estimated_tokens:,}")
        report.append(f"  • Parallel execution: {'Yes' if analysis.parallel_capable else 'No'}")
        report.append(f"  • Expected time: {self._estimate_time(analysis)} seconds")
        
        return "\n".join(report)
    
    def _estimate_time(self, analysis: ChangeAnalysis) -> str:
        """Estimate execution time based on analysis."""
        if analysis.parallel_capable:
            # Parallel execution - time of slowest agent
            max_agent_time = max([
                self.agent_token_estimates.get(agent, 1500) / 500  # ~500 tokens per second
                for agent in analysis.agent_recommendations.keys()
            ])
            return f"{max_agent_time:.1f}"
        else:
            # Sequential execution
            total_time = analysis.estimated_tokens / 500
            return f"{total_time:.1f}"

def main():
    """CLI interface for change analyzer."""
    if len(sys.argv) < 2:
        print("Usage: python3 change-analyzer.py <file1> [file2] [...]")
        print("   or: python3 change-analyzer.py --from-trigger")
        sys.exit(1)
    
    project_root = Path(__file__).parent.parent
    analyzer = ChangeAnalyzer(project_root)
    
    if sys.argv[1] == '--from-trigger':
        # Read from trigger file
        trigger_file = project_root / ".claude" / "doc-update-needed.trigger"
        if not trigger_file.exists():
            print("❌ No trigger file found")
            sys.exit(1)
        
        with open(trigger_file) as f:
            trigger_data = json.load(f)
        
        file_paths = trigger_data.get('changes_detected', [])
    else:
        # Use command line arguments
        file_paths = sys.argv[1:]
    
    if not file_paths:
        print("❌ No files to analyze")
        sys.exit(1)
    
    # Perform analysis
    analysis = analyzer.analyze_files(file_paths)
    
    # Generate and display report
    report = analyzer.generate_report(analysis)
    print(report)
    
    # Optionally save analysis to file
    analysis_file = project_root / ".claude" / "last-change-analysis.json"
    with open(analysis_file, 'w') as f:
        json.dump(asdict(analysis), f, indent=2)
    
    print(f"\n💾 Analysis saved to: {analysis_file}")

if __name__ == "__main__":
    main()