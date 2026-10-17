#!/usr/bin/env python3
"""
Accessibility Audit Script for Next.js Projects
Checks for common WCAG 2.1 AA and RGAA 4.1 violations
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple

class AccessibilityChecker:
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.issues = []
        
    def scan_project(self):
        """Scan all JSX/TSX files in the project"""
        patterns = ['**/*.jsx', '**/*.tsx']
        files = []
        
        for pattern in patterns:
            files.extend(self.project_path.glob(pattern))
        
        for file in files:
            if 'node_modules' not in str(file):
                self.check_file(file)
        
        return self.generate_report()
    
    def check_file(self, file_path: Path):
        """Check a single file for accessibility issues"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
                # Check for issues
                self.check_images(content, lines, file_path)
                self.check_buttons(content, lines, file_path)
                self.check_forms(content, lines, file_path)
                self.check_headings(content, lines, file_path)
                self.check_aria(content, lines, file_path)
                self.check_links(content, lines, file_path)
                
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    def check_images(self, content: str, lines: List[str], file_path: Path):
        """Check for images without alt text"""
        # Check <img> tags
        img_pattern = r'<img\s+[^>]*>'
        for match in re.finditer(img_pattern, content, re.IGNORECASE):
            img_tag = match.group()
            line_num = content[:match.start()].count('\n') + 1
            
            if 'alt=' not in img_tag.lower():
                self.add_issue(
                    'Critical',
                    'Missing alt attribute on <img>',
                    f'{file_path}:{line_num}',
                    'WCAG 1.1.1 (A)',
                    img_tag.strip()
                )
            elif re.search(r'alt=[\"\'][\"\']', img_tag):
                self.add_issue(
                    'Warning',
                    'Empty alt attribute (consider if decorative)',
                    f'{file_path}:{line_num}',
                    'WCAG 1.1.1 (A)',
                    img_tag.strip()
                )
        
        # Check Next.js Image component
        image_pattern = r'<Image\s+[^>]*>'
        for match in re.finditer(image_pattern, content):
            img_tag = match.group()
            line_num = content[:match.start()].count('\n') + 1
            
            if 'alt=' not in img_tag:
                self.add_issue(
                    'Critical',
                    'Missing alt attribute on <Image>',
                    f'{file_path}:{line_num}',
                    'WCAG 1.1.1 (A)',
                    img_tag.strip()
                )
    
    def check_buttons(self, content: str, lines: List[str], file_path: Path):
        """Check for div/span used as buttons without proper semantics"""
        # Check for onClick on non-button elements
        pattern = r'<(div|span)[^>]*onClick[^>]*>'
        for match in re.finditer(pattern, content, re.IGNORECASE):
            element = match.group()
            line_num = content[:match.start()].count('\n') + 1
            
            # Check if it has role="button" and proper keyboard support
            has_button_role = 'role="button"' in element or "role='button'" in element
            has_tabindex = 'tabIndex' in element or 'tabindex' in element
            has_keyboard = 'onKeyDown' in element or 'onKeyPress' in element
            
            if not has_button_role:
                self.add_issue(
                    'Important',
                    f'<{match.group(1)}> with onClick should have role="button"',
                    f'{file_path}:{line_num}',
                    'WCAG 4.1.2 (A)',
                    element.strip()
                )
            
            if not (has_tabindex and has_keyboard):
                self.add_issue(
                    'Important',
                    'Interactive element needs tabIndex and keyboard handler',
                    f'{file_path}:{line_num}',
                    'WCAG 2.1.1 (A)',
                    'Add: tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleClick()}'
                )
    
    def check_forms(self, content: str, lines: List[str], file_path: Path):
        """Check for form accessibility issues"""
        # Check for inputs without labels
        input_pattern = r'<input\s+[^>]*>'
        for match in re.finditer(input_pattern, content, re.IGNORECASE):
            input_tag = match.group()
            line_num = content[:match.start()].count('\n') + 1
            
            # Check if input has id and if there's a corresponding label
            id_match = re.search(r'id=[\"\']([^\"\']+)[\"\']', input_tag)
            has_aria_label = 'aria-label' in input_tag or 'aria-labelledby' in input_tag
            
            if id_match and not has_aria_label:
                input_id = id_match.group(1)
                if f'htmlFor="{input_id}"' not in content and f"htmlFor='{input_id}'" not in content:
                    self.add_issue(
                        'Critical',
                        f'Input with id="{input_id}" has no associated label',
                        f'{file_path}:{line_num}',
                        'WCAG 1.3.1 (A) / RGAA 11.1',
                        'Add: <label htmlFor="' + input_id + '">Label text</label>'
                    )
            elif not id_match and not has_aria_label:
                self.add_issue(
                    'Critical',
                    'Input missing both id/label and aria-label',
                    f'{file_path}:{line_num}',
                    'WCAG 1.3.1 (A) / RGAA 11.1',
                    input_tag.strip()
                )
    
    def check_headings(self, content: str, lines: List[str], file_path: Path):
        """Check heading hierarchy"""
        headings = []
        for match in re.finditer(r'<h([1-6])[^>]*>', content, re.IGNORECASE):
            level = int(match.group(1))
            line_num = content[:match.start()].count('\n') + 1
            headings.append((level, line_num))
        
        # Check if h1 exists
        if headings and headings[0][0] != 1:
            self.add_issue(
                'Important',
                'Page should start with <h1>',
                f'{file_path}:{headings[0][1]}',
                'WCAG 1.3.1 (A) / RGAA 9.1',
                'First heading should be h1'
            )
        
        # Check for skipped levels
        for i in range(1, len(headings)):
            prev_level, prev_line = headings[i-1]
            curr_level, curr_line = headings[i]
            
            if curr_level > prev_level + 1:
                self.add_issue(
                    'Warning',
                    f'Heading level skipped: h{prev_level} to h{curr_level}',
                    f'{file_path}:{curr_line}',
                    'WCAG 1.3.1 (A) / RGAA 9.1',
                    f'Should be h{prev_level + 1} instead of h{curr_level}'
                )
    
    def check_aria(self, content: str, lines: List[str], file_path: Path):
        """Check for invalid ARIA attributes"""
        # Check for invalid aria-* attributes
        aria_pattern = r'aria-([a-z]+)=[\"\']([^\"\']+)[\"\']'
        
        valid_aria = {
            'label', 'labelledby', 'describedby', 'hidden', 'live', 'atomic',
            'busy', 'controls', 'current', 'expanded', 'haspopup', 'invalid',
            'level', 'modal', 'multiline', 'multiselectable', 'orientation',
            'pressed', 'readonly', 'required', 'selected', 'sort', 'valuemax',
            'valuemin', 'valuenow', 'valuetext', 'checked', 'disabled'
        }
        
        for match in re.finditer(aria_pattern, content):
            attr = match.group(1)
            line_num = content[:match.start()].count('\n') + 1
            
            if attr not in valid_aria:
                self.add_issue(
                    'Important',
                    f'Potentially invalid ARIA attribute: aria-{attr}',
                    f'{file_path}:{line_num}',
                    'WCAG 4.1.2 (A)',
                    match.group()
                )
    
    def check_links(self, content: str, lines: List[str], file_path: Path):
        """Check for links with unclear text"""
        link_pattern = r'<a[^>]*>([^<]+)</a>'
        generic_text = ['click here', 'here', 'read more', 'more', 'link']
        
        for match in re.finditer(link_pattern, content, re.IGNORECASE):
            link_text = match.group(1).strip().lower()
            line_num = content[:match.start()].count('\n') + 1
            
            if link_text in generic_text:
                self.add_issue(
                    'Warning',
                    f'Link text "{link_text}" is not descriptive',
                    f'{file_path}:{line_num}',
                    'WCAG 2.4.4 (A) / RGAA 6.1',
                    'Use descriptive text like "Read the documentation"'
                )
    
    def add_issue(self, severity: str, message: str, location: str, 
                  standard: str, details: str):
        """Add an issue to the list"""
        self.issues.append({
            'severity': severity,
            'message': message,
            'location': location,
            'standard': standard,
            'details': details
        })
    
    def generate_report(self) -> str:
        """Generate a formatted report"""
        if not self.issues:
            return "\n✅ No accessibility issues found!\n"
        
        report = ["\n🔍 ACCESSIBILITY AUDIT REPORT\n"]
        report.append("=" * 80 + "\n")
        
        # Group by severity
        critical = [i for i in self.issues if i['severity'] == 'Critical']
        important = [i for i in self.issues if i['severity'] == 'Important']
        warnings = [i for i in self.issues if i['severity'] == 'Warning']
        
        # Summary
        report.append(f"Total Issues: {len(self.issues)}")
        report.append(f"  - Critical: {len(critical)}")
        report.append(f"  - Important: {len(important)}")
        report.append(f"  - Warnings: {len(warnings)}\n")
        
        # Critical issues
        if critical:
            report.append("\n🚨 CRITICAL ISSUES (Must Fix)")
            report.append("-" * 80)
            for issue in critical:
                report.append(f"\n{issue['message']}")
                report.append(f"  Location: {issue['location']}")
                report.append(f"  Standard: {issue['standard']}")
                report.append(f"  Details: {issue['details']}\n")
        
        # Important issues
        if important:
            report.append("\n⚠️  IMPORTANT ISSUES (Should Fix)")
            report.append("-" * 80)
            for issue in important:
                report.append(f"\n{issue['message']}")
                report.append(f"  Location: {issue['location']}")
                report.append(f"  Standard: {issue['standard']}")
                report.append(f"  Details: {issue['details']}\n")
        
        # Warnings
        if warnings:
            report.append("\n💡 WARNINGS (Consider Fixing)")
            report.append("-" * 80)
            for issue in warnings:
                report.append(f"\n{issue['message']}")
                report.append(f"  Location: {issue['location']}")
                report.append(f"  Standard: {issue['standard']}")
                report.append(f"  Details: {issue['details']}\n")
        
        report.append("\n" + "=" * 80)
        report.append("\n✨ Accessibility Score: " + 
                     f"{max(0, 100 - len(critical)*10 - len(important)*5 - len(warnings)*2)}/100\n")
        
        return "\n".join(report)


def main():
    if len(sys.argv) < 2:
        print("Usage: python check_accessibility.py <project-path>")
        sys.exit(1)
    
    project_path = sys.argv[1]
    
    if not os.path.exists(project_path):
        print(f"Error: Project path '{project_path}' does not exist")
        sys.exit(1)
    
    print(f"\n🔍 Scanning {project_path} for accessibility issues...")
    
    checker = AccessibilityChecker(project_path)
    report = checker.scan_project()
    
    print(report)


if __name__ == "__main__":
    main()
