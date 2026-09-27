import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutWrapperComponent } from '../../shared/components/layouts/layout-wrapper.component';

interface AboutService {
  title: string;
  description: string;
  icon: string;
}

interface AboutStep {
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
})
export class AboutComponent {
  readonly industries = [
    'Oil & Gas',
    'District Cooling Plants',
    'Water Treatment & Utilities',
    'CNC & Precision Engineering',
    'Cement Industry',
    'Paper Industry',
    'Manufacturing & Industrial Plants',
    'Engineering & Maintenance',
    'Industrial Automation',
    'Process Industries',
  ];

  readonly services: AboutService[] = [
    {
      title: 'Industrial Components',
      description: 'products and components for plant operations, maintenance, production, and engineering applications.',
      icon: 'build',
    },
    {
      title: 'Engineering Supplies',
      description: 'equipment and products required across diverse industrial applications.',
      icon: 'precision_manufacturing',
    },
    {
      title: 'Specialized Requirements',
      description: "share specifications, drawings, or technical details for hard-to-find products; we'll find a way.",
      icon: 'tune',
    },
    {
      title: 'Import & Export Sourcing',
      description: 'supporting sourcing and movement of products across markets, per applicable commercial/regulatory requirements.',
      icon: 'swap_horiz',
    },
  ];

  readonly steps: AboutStep[] = [
    {
      title: 'Understand',
      description: 'learn the application, specification, quantity, and delivery requirement.',
    },
    {
      title: 'Source',
      description: 'identify suitable products and potential sources.',
    },
    {
      title: 'Evaluate',
      description: 'assess specifications, commercial terms, and availability.',
    },
    {
      title: 'Supply',
      description: 'coordinate delivery efficiently to the destination.',
    },
  ];

  readonly visionPoints = [
    'Reliable sourcing',
    'Responsive communication',
    'Competitive commercial solutions',
    'Industry-focused product selection',
    'Transparent business practices',
    'Efficient import and export coordination',
    'Continuous expansion of our product and supplier network',
  ];
}
