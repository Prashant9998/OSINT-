"""
Report Generator Module
Generates professional PDF reports from OSINT scan results
"""

import os
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from config import settings
from models import ScanResult, RiskLevel

def generate_pdf_report(scan_result: ScanResult) -> str:
    """
    Generate a PDF report for a given scan result
    Returns: Path to the generated PDF file
    """
    
    # Ensure reports directory exists
    report_dir = settings.REPORTS_DIR
    if not os.path.exists(report_dir):
        os.makedirs(report_dir)
        
    filename = f"osint_report_{scan_result.scan_id}.pdf"
    filepath = os.path.join(report_dir, filename)
    
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='CenterTitle', parent=styles['Heading1'], alignment=TA_CENTER, spaceAfter=20))
    styles.add(ParagraphStyle(name='SectionHeader', parent=styles['Heading2'], spaceBefore=15, spaceAfter=10, textColor=colors.HexColor('#00B4D8')))
    styles.add(ParagraphStyle(name='RiskCritical', parent=styles['BodyText'], textColor=colors.red, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='RiskHigh', parent=styles['BodyText'], textColor=colors.orange, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='RiskMedium', parent=styles['BodyText'], textColor=colors.#FFD700, fontName='Helvetica-Bold')) # Gold
    styles.add(ParagraphStyle(name='RiskLow', parent=styles['BodyText'], textColor=colors.green, fontName='Helvetica-Bold'))
    
    story = []
    
    # --- Title Page ---
    story.append(Paragraph(f"{settings.APP_NAME}", styles['CenterTitle']))
    story.append(Paragraph("Intelligence Report", styles['Title']))
    story.append(Spacer(1, 20))
    
    # Metadata Table
    data = [
        ["Target", scan_result.target],
        ["Scan ID", scan_result.scan_id],
        ["Scan Type", scan_result.scan_type],
        ["Date", scan_result.completed_at.strftime("%Y-%m-%d %H:%M:%S") if scan_result.completed_at else "N/A"],
        ["Risk Score", f"{scan_result.correlated_intel.risk_score}/100" if scan_result.correlated_intel else "N/A"]
    ]
    
    t = Table(data, colWidths=[100, 300])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#001F3F')), # Dark Blue
        ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (1, 0), (1, -1), colors.whitesmoke),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.black),
    ]))
    story.append(t)
    story.append(Spacer(1, 30))
    
    # --- Executive Summary ---
    story.append(Paragraph("Executive Summary", styles['SectionHeader']))
    
    if scan_result.correlated_intel:
        risk_level = scan_result.correlated_intel.risk_level
        risk_color = styles['RiskLow']
        if risk_level == RiskLevel.CRITICAL: risk_color = styles['RiskCritical']
        elif risk_level == RiskLevel.HIGH: risk_color = styles['RiskHigh']
        elif risk_level == RiskLevel.MEDIUM: risk_color = styles['RiskMedium']
        
        story.append(Paragraph(f"Risk Level: {risk_level.upper()}", risk_color))
        
        # Key Findings
        if scan_result.correlated_intel.key_findings:
            story.append(Spacer(1, 10))
            story.append(Paragraph("Key Findings:", styles['Heading3']))
            for finding in scan_result.correlated_intel.key_findings:
                story.append(Paragraph(f"• {finding}", styles['BodyText']))
    else:
        story.append(Paragraph("No intelligence correlation data available.", styles['BodyText']))
        
    story.append(Spacer(1, 20))
    
    # --- Attack Surface ---
    story.append(Paragraph("Attack Surface Analysis", styles['SectionHeader']))
    if scan_result.correlated_intel and scan_result.correlated_intel.attack_surface:
        table_data = [["Type", "Name", "Risk", "Description"]]
        for item in scan_result.correlated_intel.attack_surface[:15]: # Limit rows for brevity
            table_data.append([
                item.item_type.replace('_', ' ').title(),
                Paragraph(item.name, styles['BodyText']), # Wrap long names
                item.risk_level.upper(),
                Paragraph(item.description, styles['BodyText'])
            ])
            
        t2 = Table(table_data, colWidths=[80, 150, 60, 200])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#00B4D8')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FontName', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(t2)
    else:
        story.append(Paragraph("No attack surface vectors identified.", styles['BodyText']))
        
    story.append(Spacer(1, 20))
    
    # --- Recommendations ---
    story.append(Paragraph("Security Recommendations", styles['SectionHeader']))
    if scan_result.correlated_intel and scan_result.correlated_intel.recommendations:
        for rec in scan_result.correlated_intel.recommendations:
            story.append(Paragraph(f"► {rec}", styles['BodyText']))
            story.append(Spacer(1, 5))
    else:
        story.append(Paragraph("No specific recommendations generated.", styles['BodyText']))
        
    # Build PDF
    doc.build(story)
    
    return filepath
