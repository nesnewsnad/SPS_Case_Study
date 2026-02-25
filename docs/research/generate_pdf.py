#!/usr/bin/env python3
"""Generate PDF from workstream-b-research.md"""

import re
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)

# Colors
NAVY = HexColor("#1C2833")
TEAL = HexColor("#277884")
CORAL = HexColor("#FE4447")
LIGHT_GRAY = HexColor("#F4F6F7")
MED_GRAY = HexColor("#D5D8DC")
DARK_GRAY = HexColor("#566573")
WHITE = HexColor("#FFFFFF")
GREEN = HexColor("#27AE60")
AMBER = HexColor("#F39C12")
RED_LIGHT = HexColor("#FADBD8")

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle(
    'CustomTitle', parent=styles['Title'],
    fontSize=22, textColor=NAVY, spaceAfter=6,
    fontName='Helvetica-Bold'
)
subtitle_style = ParagraphStyle(
    'Subtitle', parent=styles['Normal'],
    fontSize=11, textColor=DARK_GRAY, spaceAfter=20,
    fontName='Helvetica'
)
h1_style = ParagraphStyle(
    'H1', parent=styles['Heading1'],
    fontSize=16, textColor=NAVY, spaceBefore=24, spaceAfter=10,
    fontName='Helvetica-Bold', borderWidth=0,
    borderPadding=0, borderColor=TEAL,
)
h2_style = ParagraphStyle(
    'H2', parent=styles['Heading2'],
    fontSize=13, textColor=TEAL, spaceBefore=16, spaceAfter=8,
    fontName='Helvetica-Bold'
)
h3_style = ParagraphStyle(
    'H3', parent=styles['Heading3'],
    fontSize=11, textColor=NAVY, spaceBefore=12, spaceAfter=6,
    fontName='Helvetica-Bold'
)
body_style = ParagraphStyle(
    'Body', parent=styles['Normal'],
    fontSize=9.5, textColor=NAVY, spaceAfter=6,
    fontName='Helvetica', leading=13
)
bullet_style = ParagraphStyle(
    'Bullet', parent=body_style,
    leftIndent=18, bulletIndent=6, spaceAfter=4,
    bulletFontName='Helvetica', bulletFontSize=9.5,
)
bold_body = ParagraphStyle(
    'BoldBody', parent=body_style,
    fontName='Helvetica-Bold'
)
confidence_high = ParagraphStyle(
    'ConfHigh', parent=body_style,
    textColor=GREEN, fontName='Helvetica-Bold', fontSize=9
)
confidence_med = ParagraphStyle(
    'ConfMed', parent=body_style,
    textColor=AMBER, fontName='Helvetica-Bold', fontSize=9
)
table_header_style = ParagraphStyle(
    'TableHeader', parent=body_style,
    fontSize=8.5, fontName='Helvetica-Bold', textColor=WHITE, leading=11
)
table_cell_style = ParagraphStyle(
    'TableCell', parent=body_style,
    fontSize=8.5, leading=11, textColor=NAVY
)
table_cell_bold = ParagraphStyle(
    'TableCellBold', parent=table_cell_style,
    fontName='Helvetica-Bold'
)


def make_table(headers, rows, col_widths=None):
    """Create a styled table."""
    header_cells = [Paragraph(h, table_header_style) for h in headers]
    data = [header_cells]
    for row in rows:
        data.append([Paragraph(str(c), table_cell_style) for c in row])

    if col_widths is None:
        col_widths = [6.5 * inch / len(headers)] * len(headers)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), WHITE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ('GRID', (0, 0), (-1, -1), 0.5, MED_GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ]))
    return t


def b(text):
    """Bold text."""
    return f'<b>{text}</b>'


def build_pdf():
    doc = SimpleDocTemplate(
        "/Users/danswensen/Desktop/SPS_Case_Study/docs/research/workstream-b-research.pdf",
        pagesize=letter,
        leftMargin=0.75*inch, rightMargin=0.75*inch,
        topMargin=0.75*inch, bottomMargin=0.75*inch
    )

    story = []

    # ── Title ──
    story.append(Paragraph("Workstream B Research", title_style))
    story.append(Paragraph("Workflow Automation Opportunities at SPS Health", subtitle_style))
    story.append(Paragraph("Date: 2026-02-25 | Pre-internship research to identify likely manual workflows and automation candidates before discovery sessions with department leaders.", body_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=TEAL, spaceAfter=12))

    # ── Section 1: Company Profile ──
    story.append(Paragraph("1. SPS Health Company Profile", h1_style))
    story.append(Paragraph("What They Are", h2_style))
    story.append(Paragraph(
        'SPS Health (legal name: Summit Pharmacy Solutions, LLC) is a <b>PE-backed pharmacy benefit administration and services platform</b> headquartered in Milwaukee, WI. Founded September 2021, ~75-120 employees, ~$10.6M revenue. Nautic Partners invested in January 2022 (~$50.5M total funding).',
        body_style
    ))
    story.append(Paragraph(
        '<b>They are NOT a pharmacy.</b> They provide technology-enabled services to LTC, correctional, and behavioral health pharmacies.',
        body_style
    ))
    story.append(Spacer(1, 6))

    # Subsidiaries table
    story.append(Paragraph("Subsidiaries", h2_style))
    story.append(make_table(
        ['Entity', 'Focus'],
        [
            ['LithiaRx', 'Formulary management, claims adjudication, rebate submission/auditing'],
            ['Trinity Healthcare Solutions', 'Consulting: formulary optimization, data analytics, pharmacy network strategy'],
            ['StatimRx', 'On-demand pharmacy logistics, 70K+ retail pharmacy network, delivery platform'],
        ],
        col_widths=[1.8*inch, 4.7*inch]
    ))
    story.append(Spacer(1, 8))

    # Leadership table
    story.append(Paragraph("Key Leadership (relevant to Workstream B)", h2_style))
    story.append(make_table(
        ['Name', 'Title', 'Relevance'],
        [
            ['Neil Bansal', 'CEO', 'Wharton MBA, finance/growth strategy background'],
            ['Trond Berg', 'VP, Analytics & Commercial Strategy', 'Owns analytics function \u2014 likely stakeholder'],
            ['Tami Klumb', 'VP, PBM Services', 'Owns PBM operations \u2014 likely stakeholder'],
            ['Christine Spath', 'Controller', 'Finance \u2014 CFO/VP Finance mentioned in scope as final approvers'],
            ['Laurel Wala', 'General Counsel & CCO', 'Compliance workflows'],
            ['Andrea Talmage', 'VP, Human Resources', 'HR workflows'],
        ],
        col_widths=[1.3*inch, 2.2*inch, 3.0*inch]
    ))
    story.append(Spacer(1, 8))

    # Tech Stack
    story.append(Paragraph("Tech Stack", h2_style))
    tech_items = [
        '<b>Microsoft 365</b> (Teams, Outlook, SharePoint, Excel) \u2014 confirmed',
        '<b>SharePoint</b> \u2014 confirmed as document management / intranet platform',
        '<b>Azure cloud</b> (data pipelines, microservices)',
        '<b>.NET Core / ASP.NET Core</b> applications',
        '<b>Power Platform</b> available (Power Automate, Power BI, Power Apps) \u2014 included with M365 licensing',
        '<b>Plenful partnership</b> (Oct 2023) \u2014 AI workflow automation for pharmacy operations',
        '<b>SoftWriters/FrameworkLTC integration</b> (Jul 2025) \u2014 delivery logistics API',
        '<b>HIPAA/SOC2/GDPR compliance</b> framework',
    ]
    for item in tech_items:
        story.append(Paragraph(item, bullet_style, bulletText='\u2022'))

    # Culture
    story.append(Paragraph("Company Culture Signals", h2_style))
    culture_items = [
        '3x consecutive Top Workplace (Milwaukee Journal Sentinel)',
        'Won "New Ideas" specialty award (2025) \u2014 leadership values innovation',
        'Hiring data engineers and app developers \u2014 still building infrastructure',
        '"That\'s the way we have always done it" resistance cited as industry challenge',
    ]
    for item in culture_items:
        story.append(Paragraph(item, bullet_style, bulletText='\u2022'))

    # ── Section 2: Industry Context ──
    story.append(Paragraph("2. Industry Context: Where Manual Work Lives", h1_style))
    story.append(Paragraph("The PBM/LTC Pharmacy Pain Point Map", h2_style))
    story.append(Paragraph('<b>Confidence: HIGH</b> \u2014 synthesized from industry reports, job postings, vendor marketing, and trade publications.', body_style))
    story.append(Spacer(1, 4))
    story.append(make_table(
        ['Pain Point', 'Industry Prevalence', 'SPS Relevance'],
        [
            ['Excel-driven client reporting', 'Universal', 'HIGH \u2014 Trinity does analytics/reporting'],
            ['Manual rebate reconciliation', 'Universal', 'HIGH \u2014 LithiaRx does rebate submission'],
            ['State-by-state compliance filings', 'Growing rapidly', 'HIGH \u2014 regulatory tsunami 2025-2028'],
            ['Ad-hoc SQL reporting', 'Very common', 'MEDIUM \u2014 VP Analytics likely deals with this'],
            ['Manual prior authorization', 'Universal in PBMs', 'MEDIUM \u2014 depends on SPS service scope'],
            ['Client onboarding paperwork', 'Common', 'MEDIUM \u2014 75-90 day process industry-wide'],
            ['Data format normalization', 'Universal', 'MEDIUM \u2014 multiple data sources'],
            ['Invoice/billing reconciliation', 'Universal', 'HIGH \u2014 finance team'],
            ['Contract analysis/extraction', 'Common', 'MEDIUM \u2014 depends on contract volume'],
        ],
        col_widths=[2.2*inch, 1.5*inch, 2.8*inch]
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("The Regulatory Tsunami", h2_style))
    story.append(Paragraph('Federal and state PBM reform is creating massive new compliance reporting burdens:', body_style))
    reg_items = [
        '<b>2026</b>: MA staggered reporting deadlines, proposed ERISA transparency rules',
        '<b>2027</b>: CO delinking law effective',
        '<b>2028</b>: Federal PBM annual reporting to plan sponsors + HHS (July 1 deadline)',
        '<b>Penalties</b>: $10K/day for failure to disclose; $100K per false item',
    ]
    for item in reg_items:
        story.append(Paragraph(item, bullet_style, bulletText='\u2022'))
    story.append(Paragraph('For a ~100-person company, manual compliance is unsustainable.', bold_body))

    # ── Section 3: Likely Internal Workflows ──
    story.append(Paragraph("3. Likely Internal Workflows at SPS Health", h1_style))
    story.append(Paragraph('Based on company structure, services offered, industry norms, and job posting evidence.', body_style))

    departments = [
        ("Finance Department (Controller Christine Spath, reports to CFO)", [
            ("F1. Rebate Reconciliation", "HIGH", [
                "LithiaRx submits rebates to manufacturers on behalf of pharmacy clients",
                "Reconciliation = matching manufacturer payments back to the specific claims that generated them",
                "Industry norm: done in spreadsheets, involves double/triple-checking, error-prone",
                "<b>Volume</b>: Likely monthly or quarterly cycles",
                "<b>Pain</b>: Discrepancies between submitted claims and received payments require manual investigation",
            ]),
            ("F2. Client Invoicing / Revenue Recognition", "MEDIUM", [
                "SPS bills clients (pharmacies) for services: GPO membership, PSAO fees, LithiaRx adjudication fees, StatimRx delivery fees",
                "Multiple subsidiaries = multiple billing streams to consolidate",
                "<b>Pain</b>: Manual aggregation across subsidiary systems",
            ]),
            ("F3. GPO Vendor Payment Reconciliation", "MEDIUM", [
                "GPO negotiates pricing with drug manufacturers/vendors",
                "Tracking whether vendors honor negotiated pricing across thousands of transactions",
                "<b>Pain</b>: Comparing contracted vs. actual pricing across purchase orders",
            ]),
        ]),
        ("Analytics & Commercial Strategy (VP Trond Berg)", [
            ("A1. Client Reporting / Analytics Delivery", "HIGH", [
                'Trinity provides "cutting edge analytics functionality" to clients',
                "Industry norm: analysts write custom SQL, build Excel reports, manually curate dashboards",
                "<b>Pain</b>: Each client wants slightly different views; manual report customization is time-consuming",
                'Job postings require "Advanced Excel" and SQL \u2014 hallmark of manual reporting',
            ]),
            ("A2. Data Ingestion and Normalization", "HIGH", [
                "Claims data arrives from multiple pharmacy clients in different formats",
                'Industry-wide pain: "format changes come without notice"',
                "<b>Pain</b>: Manual ETL, format-specific parsing scripts, quality checks on each load",
            ]),
            ("A3. Contract Compliance Validation", "MEDIUM", [
                "Trinity validates that client contracts are performing as guaranteed",
                "Comparing actual rebate/pricing performance vs. contractual guarantees",
                "<b>Pain</b>: Manual comparison of contract terms against claims data outcomes",
            ]),
        ]),
        ("PBM Services (VP Tami Klumb)", [
            ("P1. Formulary Update Processing", "HIGH", [
                "Quarterly/annual formulary changes (drug additions, removals, tier changes)",
                "Each change requires: clinical review documentation, client notification, system configuration update, compliance verification",
                "<b>Pain</b>: Multi-step process with multiple handoffs and manual tracking",
            ]),
            ("P2. Prior Authorization Processing", "MEDIUM", [
                "If LithiaRx handles PA for clients: receive request \u2192 evaluate criteria \u2192 approve/deny \u2192 notify",
                "Industry: manual PA takes 10-14 days, $35B annual admin cost industry-wide",
                "SPS already partnered with Plenful (which automates PA) \u2014 may already be addressed",
            ]),
            ("P3. Claims Exception Handling", "HIGH", [
                "LithiaRx adjudicates claims in real-time; rejected claims need exception review",
                "Batch reversals (like the KS August pattern in our case study) require investigation and reprocessing",
                "<b>Pain</b>: Manual review of claim rejections, coordination with pharmacies for resubmission",
            ]),
        ]),
        ("Legal & Compliance (GC Laurel Wala)", [
            ("C1. State PBM Licensing & Registration", "HIGH", [
                "PBMs must register/license in each state they operate",
                "Different requirements, different forms, different deadlines, different renewal cycles",
                "<b>Pain</b>: Tracking deadlines across 50 states, manual form completion, document gathering",
            ]),
            ("C2. Regulatory Reporting", "HIGH", [
                "New federal transparency reporting requirements (2028 deadline)",
                "State-specific reporting (MA, CO, CA, etc.)",
                "<b>Pain</b>: Manual data aggregation, formatting to each state\u2019s requirements, deadline tracking",
            ]),
            ("C3. Contract Management", "MEDIUM", [
                "Pharmacy network contracts, manufacturer agreements, client service agreements",
                "<b>Pain</b>: Tracking expiration dates, renewal terms, obligation compliance",
            ]),
        ]),
        ("Client Services (EVP Theresa Hametz, EVP Matt Lewis)", [
            ("S1. Client Onboarding", "HIGH", [
                "New pharmacy client joining GPO/PSAO/LithiaRx network",
                "Industry norm: 75-90 day process with credentialing, system setup, testing, go-live",
                "<b>Pain</b>: Manual checklist tracking, document collection, multi-system configuration",
            ]),
            ("S2. Client Issue Resolution / Ticketing", "MEDIUM", [
                "Pharmacies contact SPS about claim rejections, delivery issues, formulary questions",
                "<b>Pain</b>: Manual tracking, no unified case management (common in small companies)",
            ]),
        ]),
        ("StatimRx Operations", [
            ("L1. Delivery Exception Management", "MEDIUM", [
                "Failed deliveries, STAT requests, courier coordination",
                "New FrameworkCourier API integration (Jul 2025) may be automating some of this",
                "<b>Pain</b>: Manual coordination when automated systems fail",
            ]),
            ("L2. Network Pharmacy Credentialing", "MEDIUM", [
                "70K+ retail pharmacy network requires credentialing and re-credentialing",
                "<b>Pain</b>: Manual verification of licenses, capabilities, compliance documentation",
            ]),
        ]),
        ("Human Resources (VP Andrea Talmage)", [
            ("H1. Employee Onboarding", "LOW", [
                "Standard HR workflow, but at ~100 employees, volume may not justify automation",
                "<b>Pain</b>: Paperwork, system access provisioning, training scheduling",
            ]),
        ]),
    ]

    for dept_name, workflows in departments:
        story.append(Paragraph(dept_name, h2_style))
        for wf_name, confidence, bullets in workflows:
            conf_color = '#27AE60' if confidence == 'HIGH' else ('#F39C12' if confidence == 'MEDIUM' else '#E74C3C')
            story.append(Paragraph(
                f'{wf_name} <font color="{conf_color}">[Confidence: {confidence}]</font>',
                h3_style
            ))
            for bullet in bullets:
                story.append(Paragraph(bullet, bullet_style, bulletText='\u2022'))
            story.append(Spacer(1, 4))

    # ── Section 4: Scoring ──
    story.append(PageBreak())
    story.append(Paragraph("4. Automation Opportunity Scoring", h1_style))
    story.append(Paragraph("Evaluation Framework (from Workstream B scope)", h2_style))
    criteria = [
        '<b>Impact</b>: Time saved, error reduction, frequency of workflow',
        '<b>Effort</b>: Complexity to build, data availability, integration requirements',
        '<b>Durability</b>: Can non-technical staff maintain it after internship?',
        '<b>Measurability</b>: Can we quantify before/after?',
        '<b>No-code/Low-code fit</b>: Can this be built without custom code?',
    ]
    for c in criteria:
        story.append(Paragraph(c, bullet_style, bulletText='\u2022'))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Scoring Matrix", h2_style))
    story.append(make_table(
        ['#', 'Workflow', 'Impact', 'Effort', 'Durability', 'Measurability', 'No-Code', 'Score'],
        [
            ['F1', 'Rebate Reconciliation', '5', '3', '4', '5', '3', '20'],
            ['A1', 'Client Reporting', '5', '4', '3', '5', '3', '20'],
            ['C1', 'State Licensing Tracking', '4', '2', '5', '4', '5', '20'],
            ['C2', 'Regulatory Reporting', '5', '4', '3', '5', '3', '20'],
            ['S1', 'Client Onboarding', '4', '2', '5', '4', '5', '20'],
            ['F2', 'Client Invoicing', '4', '3', '4', '5', '3', '19'],
            ['P1', 'Formulary Update Processing', '4', '3', '4', '4', '3', '18'],
            ['A2', 'Data Ingestion', '5', '5', '2', '4', '2', '18'],
            ['P3', 'Claims Exception Handling', '4', '4', '3', '4', '3', '18'],
            ['C3', 'Contract Management', '3', '2', '5', '3', '5', '18'],
            ['A3', 'Contract Compliance', '3', '3', '4', '4', '3', '17'],
            ['F3', 'GPO Vendor Reconciliation', '3', '3', '4', '4', '3', '17'],
            ['S2', 'Client Issue Ticketing', '3', '2', '4', '3', '5', '17'],
            ['L2', 'Network Credentialing', '3', '3', '4', '3', '4', '17'],
        ],
        col_widths=[0.35*inch, 1.7*inch, 0.55*inch, 0.55*inch, 0.7*inch, 0.85*inch, 0.65*inch, 0.5*inch]
    ))
    story.append(Paragraph('<i>Scale: 1=low, 5=high. For Effort, 5=easy, 1=hard.</i>', ParagraphStyle('Note', parent=body_style, fontSize=8, textColor=DARK_GRAY, spaceBefore=4)))

    # ── Section 5: Top Candidates ──
    story.append(Paragraph("5. Top Automation Candidates for Workstream B", h1_style))
    story.append(Paragraph("Tier 1: Highest Confidence Recommendations", h2_style))

    # Candidate A
    story.append(Paragraph("Candidate A: Compliance & Licensing Tracker", h3_style))
    story.append(Paragraph('<b>Workflow</b>: C1 (State PBM Licensing) + C3 (Contract Management)', body_style))
    cand_a = [
        'Regulatory pressure is exploding \u2014 this solves a growing pain before it becomes a crisis',
        'Highly structured data (deadlines, requirements, documents) \u2192 perfect for no-code tools',
        'Non-technical staff can maintain a tracker/dashboard',
        'Measurable: missed deadlines \u2192 0, time spent tracking \u2192 reduced by X%',
        '<b>Tool candidates</b>: SharePoint List + Power Automate (zero additional licensing). SharePoint List stores state registrations, deadlines, document links, and status. Power Automate sends automated reminders at 90/60/30/7 days before expiration, escalates overdue items, and triggers renewal checklists.',
        '<b>Deliverable</b>: Centralized compliance dashboard with automated deadline reminders, document checklists per state, renewal workflow triggers \u2014 all maintained in SharePoint by non-technical staff',
    ]
    for item in cand_a:
        story.append(Paragraph(item, bullet_style, bulletText='\u2022'))

    # Candidate B
    story.append(Paragraph("Candidate B: Client Onboarding Workflow", h3_style))
    story.append(Paragraph('<b>Workflow</b>: S1 (Client Onboarding)', body_style))
    cand_b = [
        '75-90 day process with clear, repeatable steps \u2192 natural workflow automation target',
        'Currently likely tracked in spreadsheets/email',
        'Non-technical staff are the primary users',
        'Measurable: onboarding time, dropped tasks, client satisfaction',
        '<b>Tool candidates</b>: SharePoint onboarding site (built-in templates since 2025) + Power Automate task flows. SharePoint provides the portal (checklists, document upload, status tracking), Power Automate drives the workflow. Microsoft Forms for document collection.',
        '<b>Deliverable</b>: Automated onboarding pipeline with task dependencies, document collection forms, status dashboards, automated notifications \u2014 all within the SharePoint environment staff already use',
    ]
    for item in cand_b:
        story.append(Paragraph(item, bullet_style, bulletText='\u2022'))

    # Candidate C
    story.append(Paragraph("Candidate C: Rebate Reconciliation Assistant", h3_style))
    story.append(Paragraph('<b>Workflow</b>: F1 (Rebate Reconciliation)', body_style))
    cand_c = [
        'Finance team (CFO/VP Finance are the approvers \u2014 this is their pain)',
        'High frequency, high error cost, highly measurable',
        '<b>But</b>: More technically complex \u2014 requires data from adjudication system',
        '<b>Tool candidates</b>: Excel/Power Query automation, Power Automate, or Plenful (existing partner)',
        '<b>Deliverable</b>: Semi-automated reconciliation workbook/dashboard that highlights discrepancies, tracks resolution, produces audit trail',
        '<b>Risk</b>: May overlap with Plenful partnership scope \u2014 verify in discovery',
    ]
    for item in cand_c:
        story.append(Paragraph(item, bullet_style, bulletText='\u2022'))

    story.append(Paragraph("Tier 2: Strong Candidates (explore in discovery)", h2_style))

    story.append(Paragraph("Candidate D: Client Reporting Templates", h3_style))
    cand_d = [
        'Directly serves revenue-generating function',
        'Analysts spend hours customizing reports \u2192 templates reduce to minutes',
        '<b>But</b>: Requires understanding their current analytics stack (likely Power BI given Azure)',
        '<b>Tool candidates</b>: Power BI templates, SharePoint-embedded dashboards, or Excel/Power Query templates distributed via SharePoint document library',
        '<b>Risk</b>: May be too intertwined with their custom data infrastructure',
    ]
    for item in cand_d:
        story.append(Paragraph(item, bullet_style, bulletText='\u2022'))

    story.append(Paragraph("Candidate E: Regulatory Reporting Pipeline", h3_style))
    cand_e = [
        'Federal deadline in 2028 \u2014 building now means being ready early',
        '<b>But</b>: Requirements are still being finalized (proposed rules)',
        'Better as a "phase 2" project after compliance tracker is in place',
    ]
    for item in cand_e:
        story.append(Paragraph(item, bullet_style, bulletText='\u2022'))

    # ── Section 6: Discovery Questions ──
    story.append(PageBreak())
    story.append(Paragraph("6. Discovery Session Strategy", h1_style))
    story.append(Paragraph('When you meet with department leaders, use this research to ask informed questions rather than starting from zero.', body_style))

    discovery_sections = [
        ("Questions for Finance (CFO / VP Finance / Controller)", [
            '"How do you currently reconcile manufacturer rebate payments against submitted claims? What tools do you use?"',
            '"How many hours per cycle does rebate reconciliation take? What\u2019s the error rate?"',
            '"How do you track invoicing across the three subsidiaries \u2014 is there a unified system?"',
            '"What\u2019s the most time-consuming repetitive task your team does each month?"',
        ]),
        ("Questions for Compliance (General Counsel)", [
            '"How many states do you currently hold PBM registrations in? How do you track renewal deadlines?"',
            '"Are you preparing for the 2028 federal PBM transparency reporting requirements yet?"',
            '"What\u2019s your current process for tracking regulatory changes across states?"',
            '"Have you had any close calls with compliance deadlines?"',
        ]),
        ("Questions for Client Services (EVPs)", [
            '"Walk me through what happens when a new pharmacy client signs up \u2014 what are the steps from contract to go-live?"',
            '"How do you track onboarding progress? Spreadsheet? Project management tool?"',
            '"What are the most common reasons onboarding takes longer than expected?"',
            '"How do pharmacy clients report issues to you? How do you track resolution?"',
        ]),
        ("Questions for Analytics (VP Berg)", [
            '"What does a typical client reporting cycle look like? How much is automated vs. manual?"',
            '"What tools does your team use for analytics delivery \u2014 Power BI, Excel, custom dashboards?"',
            '"How do you handle different data formats when onboarding a new pharmacy\u2019s claims data?"',
            '"What takes the most analyst time that feels like it shouldn\u2019t?"',
        ]),
        ("Questions for PBM Services (VP Klumb)", [
            '"When the formulary changes quarterly, what\u2019s the update process? How many steps and handoffs?"',
            '"How do you handle claims that get rejected \u2014 what\u2019s the exception workflow?"',
            '"Is Plenful currently automating any of your workflows? What\u2019s in scope vs. out of scope?"',
        ]),
    ]
    for section_title, questions in discovery_sections:
        story.append(Paragraph(section_title, h2_style))
        for i, q in enumerate(questions, 1):
            story.append(Paragraph(f'{i}. {q}', bullet_style))

    # ── Section 7: Impact-Effort ──
    story.append(Paragraph("7. Impact-Effort Framework for Discovery Sessions", h1_style))
    story.append(Paragraph('Use this 2\u00d72 to plot workflows during/after discovery:', body_style))
    story.append(Spacer(1, 8))

    # Build 2x2 as a table
    quadrant_tl = ParagraphStyle('QTL', parent=body_style, alignment=TA_CENTER, fontSize=9)
    q_data = [
        [Paragraph('<b>HIGH IMPACT / LOW EFFORT</b><br/><font color="#27AE60">Quick Wins (DO FIRST)</font>', quadrant_tl),
         Paragraph('<b>HIGH IMPACT / HIGH EFFORT</b><br/><font color="#F39C12">Strategic Projects (PLAN CAREFULLY)</font>', quadrant_tl)],
        [Paragraph('<b>LOW IMPACT / LOW EFFORT</b><br/><font color="#566573">Fill-ins (IF TIME)</font>', quadrant_tl),
         Paragraph('<b>LOW IMPACT / HIGH EFFORT</b><br/><font color="#E74C3C">Avoid / Defer (TOO COSTLY)</font>', quadrant_tl)],
    ]
    q_table = Table(q_data, colWidths=[3.25*inch, 3.25*inch], rowHeights=[0.8*inch, 0.8*inch])
    q_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, MED_GRAY),
        ('BACKGROUND', (0, 0), (0, 0), HexColor("#EAFAF1")),
        ('BACKGROUND', (1, 0), (1, 0), HexColor("#FEF9E7")),
        ('BACKGROUND', (0, 1), (0, 1), LIGHT_GRAY),
        ('BACKGROUND', (1, 1), (1, 1), HexColor("#FADBD8")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(q_table)
    story.append(Spacer(1, 8))

    predictions = [
        '<b>Quick Wins</b>: Compliance tracker, onboarding workflow',
        '<b>Strategic Projects</b>: Rebate reconciliation, client reporting templates',
        '<b>Fill-ins</b>: Contract management tracker, issue ticketing',
        '<b>Avoid/Defer</b>: Data ingestion automation (needs engineering), claims exception handling (too integrated with core systems)',
    ]
    for p in predictions:
        story.append(Paragraph(p, bullet_style, bulletText='\u2022'))

    # ── Section 8: Tool Recommendations ──
    story.append(Paragraph("8. Tool Recommendations for No-Code/Low-Code Solutions", h1_style))
    story.append(Paragraph('SPS Health is confirmed on Microsoft 365 with SharePoint. This makes the Power Platform the primary tooling layer \u2014 zero additional licensing cost, IT-supported, and staff already have accounts.', body_style))

    story.append(Paragraph("Primary Tools (already licensed, zero additional cost)", h2_style))
    story.append(make_table(
        ['Tool', 'Best For', 'Learning Curve', 'Durability'],
        [
            ['SharePoint Lists', 'Structured data tracking (compliance, onboarding, contracts)', 'Low', 'High'],
            ['SharePoint Sites', 'Portals, document libraries, team dashboards', 'Low', 'High'],
            ['Power Automate', 'Workflow triggers, approval routing, notifications, scheduling', 'Medium', 'High'],
            ['Power BI', 'Analytics dashboards, report templates, embedded visuals', 'Medium', 'High'],
            ['Microsoft Forms', 'Data collection, intake forms, surveys', 'Low', 'High'],
            ['Power Apps', 'Custom lightweight apps on top of SharePoint data', 'Medium-High', 'High'],
        ],
        col_widths=[1.3*inch, 3.2*inch, 1.0*inch, 1.0*inch]
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("SharePoint-Specific Automation Patterns", h2_style))
    story.append(Paragraph('These are proven, low-effort automations that map directly to SPS workflows:', body_style))
    sp_patterns = [
        ('<b>Document Approval Workflows</b>', 'SharePoint + Power Automate routes contracts, policy changes, and compliance docs through multi-stage approvals. Auto-notifies approvers, tracks status, escalates on timeout. Directly relevant to formulary changes (P1), contract management (C3), and regulatory filings (C2).'),
        ('<b>Document Library Auto-Organization</b>', 'Files uploaded to SharePoint auto-tagged with metadata (content type, department, client, date). Power Automate moves files to correct folders, applies retention labels, notifies owners. Relevant for RFP responses, compliance docs, claims documentation.'),
        ('<b>SharePoint List as Lightweight Tracker</b>', 'Custom lists with views, filters, and conditional formatting act as mini-applications. No database needed. Power Automate sends reminders on due dates and escalates overdue items. Ideal for compliance tracking (C1), contract expiration (C3), and client onboarding milestones (S1).'),
        ('<b>Form-to-Workflow Pipelines</b>', 'Microsoft Forms embedded in SharePoint pages feed directly into Power Automate flows. Use cases: PTO requests, IT provisioning, expense pre-approvals, client intake forms. 15-minute setup, highly visible, good training exercise for Week 6.'),
        ('<b>Email-to-SharePoint Archiving</b>', 'Shared mailbox emails auto-saved to SharePoint document library with metadata. Builds audit trail without manual filing. Relevant for claims correspondence, vendor communications, client issue tracking (S2).'),
        ('<b>Knowledge Bot Document Source</b>', 'SharePoint document libraries serve as the canonical intake for the RAG pipeline (Automation #1 in strategy deck). Staff add/remove docs in SharePoint (familiar interface), the Python backend watches the library via Microsoft Graph API or Power Automate trigger. No new tool for document management.'),
    ]
    for title, desc in sp_patterns:
        story.append(Paragraph(f'{title} \u2014 {desc}', bullet_style, bulletText='\u2022'))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Secondary Tools (if specific needs arise)", h2_style))
    story.append(make_table(
        ['Tool', 'Best For', 'Pricing', 'When to Use'],
        [
            ['Plenful', 'Pharmacy-specific workflow automation', 'Enterprise pricing', 'If PA or pharmacy ops workflows are target'],
            ['Zapier', 'Cross-tool automations outside M365', 'Free \u2192 $20/mo', 'Only if connecting non-Microsoft tools'],
        ],
        col_widths=[1.0*inch, 2.0*inch, 1.3*inch, 2.2*inch]
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Recommendation</b>: Build everything on <b>SharePoint + Power Automate + Power BI</b>. Zero additional licensing cost, staff already have accounts, IT already supports it. Third-party tools (Airtable, Monday, Notion) add adoption friction and recurring costs with no clear upside when Power Platform is available.', body_style))

    # ── Section 9: Open Questions ──
    story.append(Paragraph("9. Open Questions (Verify in Discovery)", h1_style))
    open_qs = [
        '<b>What does Plenful currently automate?</b> The Oct 2023 partnership may already cover some of these workflows. Don\u2019t duplicate.',
        '<b>ANSWERED: Are they on Microsoft 365?</b> Confirmed M365 with SharePoint. Power Platform available at no extra cost.',
        '<b>What\u2019s the current analytics stack?</b> Power BI vs. custom vs. Excel-only affects Candidate D. (Power BI is likely given M365 + Azure stack.)',
        '<b>Who are the CFO and VP Finance?</b> Not publicly listed \u2014 these are the final approvers per scope doc.',
        '<b>How many states do they operate in?</b> Determines compliance tracker scope.',
        '<b>What\u2019s the client count?</b> Affects onboarding workflow volume and ROI calculation.',
        '<b>Is there an existing project management tool?</b> Jira, Asana, Monday, SharePoint-based tracking, or just email/spreadsheets?',
        '<b>What does "non-technical" mean here?</b> Comfortable with Excel? Or truly no-spreadsheet users?',
    ]
    for i, q in enumerate(open_qs, 1):
        story.append(Paragraph(f'{i}. {q}', bullet_style))

    # ── Section 10: Confidence Summary ──
    story.append(Paragraph("10. Confidence Summary", h1_style))
    story.append(make_table(
        ['Finding', 'Confidence', 'Evidence'],
        [
            ['SPS is a ~100-person PE-backed PBA platform', 'HIGH', 'LinkedIn, Crunchbase, press releases'],
            ['They have LithiaRx, Trinity, StatimRx subsidiaries', 'HIGH', 'Company website, press releases'],
            ['Azure/.NET tech stack', 'HIGH', 'Job postings'],
            ['Microsoft 365 + SharePoint in use', 'HIGH', 'Confirmed by SPS contact (2026-02-25)'],
            ['Power Platform available (no extra licensing)', 'HIGH', 'Follows from confirmed M365 subscription'],
            ['Plenful AI partnership exists', 'HIGH', 'Press release Oct 2023'],
            ['Rebate reconciliation is manual/Excel-driven', 'HIGH', 'Industry-wide pattern, SPS offers this service'],
            ['Client reporting involves manual SQL/Excel work', 'HIGH', 'Job posting requirements, industry pattern'],
            ['Compliance burden is growing rapidly', 'HIGH', 'Federal/state legislation verified'],
            ['Client onboarding is a 75-90 day manual process', 'MEDIUM', 'Industry norm, not SPS-specific verification'],
            ['They use Power BI for analytics', 'MEDIUM', 'Inferred from Azure stack + confirmed M365'],
            ['HR/internal workflows are pain points', 'LOW', 'Small company, may not be high-volume enough'],
        ],
        col_widths=[2.8*inch, 0.8*inch, 2.9*inch]
    ))

    doc.build(story)
    print("PDF generated successfully.")


if __name__ == "__main__":
    build_pdf()
