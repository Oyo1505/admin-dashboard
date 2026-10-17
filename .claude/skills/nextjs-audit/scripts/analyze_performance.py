#!/usr/bin/env python3
"""
Performance Analysis Script for Next.js Projects
Analyzes bundle size, image optimization, and common performance issues
"""

import os
import re
import sys
import json
from pathlib import Path
from typing import List, Dict, Tuple

class PerformanceAnalyzer:
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.issues = []
        self.stats = {
            'total_images': 0,
            'optimized_images': 0,
            'unoptimized_images': 0,
            'client_components': 0,
            'server_components': 0,
            'dynamic_imports': 0,
            'regular_imports': 0
        }
        
    def analyze_project(self):
        """Analyze the entire project"""
        self.check_config()
        self.analyze_images()
        self.analyze_components()
        self.analyze_imports()
        self.analyze_fonts()
        self.check_package_json()
        
        return self.generate_report()
    
    def check_config(self):
        """Check Next.js configuration"""
        config_files = [
            self.project_path / 'next.config.js',
            self.project_path / 'next.config.mjs'
        ]
        
        config_content = None
        for config_file in config_files:
            if config_file.exists():
                with open(config_file, 'r') as f:
                    config_content = f.read()
                break
        
        if not config_content:
            self.add_issue(
                'Warning',
                'No next.config.js found',
                'Project root',
                'Consider adding configuration for optimization',
                'Create next.config.js with image and bundle optimizations'
            )
            return
        
        # Check for image optimization
        if 'images' not in config_content:
            self.add_issue(
                'Recommendation',
                'Image configuration not found',
                'next.config.js',
                'Add image domains and formats',
                """
images: {
  domains: ['your-cdn.com'],
  formats: ['image/avif', 'image/webp'],
}
                """
            )
        
        # Check for bundle analyzer
        if '@next/bundle-analyzer' not in config_content:
            self.add_issue(
                'Recommendation',
                'Bundle analyzer not configured',
                'next.config.js',
                'Add bundle analyzer to track bundle size',
                'npm install @next/bundle-analyzer'
            )
    
    def analyze_images(self):
        """Check image optimization"""
        # Find all image files
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
        
        # Check public directory
        public_dir = self.project_path / 'public'
        if public_dir.exists():
            for ext in image_extensions:
                images = list(public_dir.rglob(f'*{ext}'))
                self.stats['total_images'] += len(images)
        
        # Check for next/image usage
        patterns = ['**/*.jsx', '**/*.tsx']
        files = []
        
        for pattern in patterns:
            files.extend(self.project_path.glob(pattern))
        
        for file in files:
            if 'node_modules' not in str(file):
                with open(file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Check for <img> tags
                    img_count = len(re.findall(r'<img\s+', content, re.IGNORECASE))
                    if img_count > 0:
                        self.stats['unoptimized_images'] += img_count
                        line_num = content.find('<img')
                        self.add_issue(
                            'Important',
                            f'Found {img_count} <img> tag(s) - use next/image instead',
                            f'{file}',
                            'Impact: LCP, CLS, bandwidth',
                            'Replace with: import Image from "next/image"'
                        )
                    
                    # Check for next/image usage
                    image_count = len(re.findall(r'<Image\s+', content))
                    self.stats['optimized_images'] += image_count
                    
                    # Check if priority prop is used for LCP images
                    if image_count > 0:
                        priority_count = len(re.findall(r'priority[=\s]', content))
                        if priority_count == 0:
                            self.add_issue(
                                'Recommendation',
                                'No priority prop found on Image components',
                                f'{file}',
                                'Add priority to above-the-fold images',
                                'Add priority prop to LCP image: <Image priority ... />'
                            )
    
    def analyze_components(self):
        """Analyze Server vs Client components"""
        patterns = ['**/*.jsx', '**/*.tsx']
        files = []
        
        for pattern in patterns:
            files.extend(self.project_path.glob(pattern))
        
        for file in files:
            if 'node_modules' not in str(file):
                with open(file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Check for 'use client'
                    if "'use client'" in content or '"use client"' in content:
                        self.stats['client_components'] += 1
                        
                        # Check if it actually needs to be client
                        has_hooks = any(hook in content for hook in [
                            'useState', 'useEffect', 'useCallback', 'useMemo',
                            'useRef', 'useContext', 'useReducer'
                        ])
                        has_events = any(event in content for event in [
                            'onClick', 'onChange', 'onSubmit', 'onKeyDown'
                        ])
                        
                        if not has_hooks and not has_events:
                            self.add_issue(
                                'Important',
                                'Unnecessary "use client" directive',
                                f'{file}',
                                'Converts server component to client component',
                                'Remove "use client" - no hooks or event handlers found'
                            )
                    else:
                        self.stats['server_components'] += 1
    
    def analyze_imports(self):
        """Check for dynamic imports and code splitting"""
        patterns = ['**/*.jsx', '**/*.tsx']
        files = []
        
        for pattern in patterns:
            files.extend(self.project_path.glob(pattern))
        
        heavy_libraries = ['moment', 'lodash', 'chart.js', 'three', 'd3']
        
        for file in files:
            if 'node_modules' not in str(file):
                with open(file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Check for dynamic imports
                    dynamic_imports = re.findall(r'dynamic\(.*?\)', content)
                    self.stats['dynamic_imports'] += len(dynamic_imports)
                    
                    # Check for heavy libraries without dynamic import
                    for lib in heavy_libraries:
                        if f'from "{lib}"' in content or f"from '{lib}'" in content:
                            if 'dynamic(' not in content:
                                self.add_issue(
                                    'Important',
                                    f'Heavy library "{lib}" imported without code splitting',
                                    f'{file}',
                                    'Increases initial bundle size',
                                    f'Use: const {lib.title()} = dynamic(() => import("{lib}"))'
                                )
                    
                    # Check for lodash full import
                    if re.search(r'from ["\']lodash["\']', content):
                        self.add_issue(
                            'Important',
                            'Importing entire lodash library',
                            f'{file}',
                            'Adds ~70KB to bundle',
                            'Use: import debounce from "lodash/debounce"'
                        )
    
    def analyze_fonts(self):
        """Check font loading strategy"""
        # Check for next/font usage
        patterns = ['**/*.jsx', '**/*.tsx']
        files = []
        
        for pattern in patterns:
            files.extend(self.project_path.glob(pattern))
        
        uses_next_font = False
        for file in files:
            if 'node_modules' not in str(file):
                with open(file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'next/font' in content:
                        uses_next_font = True
                        break
        
        if not uses_next_font:
            # Check for Google Fonts in layout or _document
            layout_files = list(self.project_path.glob('**/layout.tsx')) + \
                          list(self.project_path.glob('**/layout.jsx')) + \
                          list(self.project_path.glob('**/_document.tsx'))
            
            for file in layout_files:
                with open(file, 'r') as f:
                    content = f.read()
                    if 'fonts.googleapis.com' in content:
                        self.add_issue(
                            'Important',
                            'Using external Google Fonts without next/font',
                            f'{file}',
                            'Causes layout shift and slower loading',
                            """
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
                            """
                        )
    
    def check_package_json(self):
        """Check dependencies and scripts"""
        package_json = self.project_path / 'package.json'
        
        if not package_json.exists():
            return
        
        with open(package_json, 'r') as f:
            data = json.load(f)
        
        dependencies = data.get('dependencies', {})
        dev_dependencies = data.get('devDependencies', {})
        
        # Check Next.js version
        next_version = dependencies.get('next', '')
        if next_version:
            version_num = re.search(r'\d+', next_version)
            if version_num and int(version_num.group()) < 14:
                self.add_issue(
                    'Recommendation',
                    f'Next.js version {next_version} is outdated',
                    'package.json',
                    'Consider upgrading to Next.js 14+',
                    'npm install next@latest'
                )
        
        # Check for bundle analyzer
        if '@next/bundle-analyzer' not in dev_dependencies:
            self.add_issue(
                'Recommendation',
                'Bundle analyzer not installed',
                'package.json',
                'Track bundle size over time',
                'npm install -D @next/bundle-analyzer'
            )
    
    def add_issue(self, severity: str, message: str, location: str, 
                  impact: str, solution: str):
        """Add a performance issue"""
        self.issues.append({
            'severity': severity,
            'message': message,
            'location': location,
            'impact': impact,
            'solution': solution
        })
    
    def generate_report(self) -> str:
        """Generate performance report"""
        report = ["\n⚡ PERFORMANCE AUDIT REPORT\n"]
        report.append("=" * 80 + "\n")
        
        # Statistics
        report.append("📊 PROJECT STATISTICS\n")
        report.append(f"  Images:")
        report.append(f"    - Total: {self.stats['total_images']}")
        report.append(f"    - Optimized (next/image): {self.stats['optimized_images']}")
        report.append(f"    - Unoptimized (<img>): {self.stats['unoptimized_images']}")
        report.append(f"\n  Components:")
        report.append(f"    - Server Components: {self.stats['server_components']}")
        report.append(f"    - Client Components: {self.stats['client_components']}")
        report.append(f"\n  Code Splitting:")
        report.append(f"    - Dynamic Imports: {self.stats['dynamic_imports']}\n")
        
        # Calculate score
        score = 100
        if self.stats['unoptimized_images'] > 0:
            score -= min(20, self.stats['unoptimized_images'] * 5)
        if self.stats['client_components'] > self.stats['server_components']:
            score -= 10
        
        report.append(f"\n🎯 Performance Score: {max(0, score)}/100\n")
        
        # Group issues by severity
        important = [i for i in self.issues if i['severity'] == 'Important']
        recommendations = [i for i in self.issues if i['severity'] == 'Recommendation']
        warnings = [i for i in self.issues if i['severity'] == 'Warning']
        
        # Important issues
        if important:
            report.append("\n🚨 IMPORTANT ISSUES (Fix Before Production)")
            report.append("-" * 80)
            for issue in important:
                report.append(f"\n{issue['message']}")
                report.append(f"  Location: {issue['location']}")
                report.append(f"  Impact: {issue['impact']}")
                report.append(f"  Solution: {issue['solution']}\n")
        
        # Recommendations
        if recommendations:
            report.append("\n💡 RECOMMENDATIONS")
            report.append("-" * 80)
            for issue in recommendations:
                report.append(f"\n{issue['message']}")
                report.append(f"  Location: {issue['location']}")
                report.append(f"  Impact: {issue['impact']}")
                report.append(f"  Solution: {issue['solution']}\n")
        
        # Warnings
        if warnings:
            report.append("\n⚠️  WARNINGS")
            report.append("-" * 80)
            for issue in warnings:
                report.append(f"\n{issue['message']}")
                report.append(f"  Location: {issue['location']}")
                report.append(f"  Impact: {issue['impact']}")
                report.append(f"  Solution: {issue['solution']}\n")
        
        if not self.issues:
            report.append("\n✅ No major performance issues found!\n")
        
        report.append("\n" + "=" * 80 + "\n")
        
        return "\n".join(report)


def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze_performance.py <project-path>")
        sys.exit(1)
    
    project_path = sys.argv[1]
    
    if not os.path.exists(project_path):
        print(f"Error: Project path '{project_path}' does not exist")
        sys.exit(1)
    
    print(f"\n⚡ Analyzing {project_path} for performance issues...")
    
    analyzer = PerformanceAnalyzer(project_path)
    report = analyzer.analyze_project()
    
    print(report)


if __name__ == "__main__":
    main()
