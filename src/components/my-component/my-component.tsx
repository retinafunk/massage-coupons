import { Component, Prop, h } from '@stencil/core';
import { format } from '../../utils/utils';
import jsPDF from 'jspdf';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
  /**
   * The first name
   */
  @Prop() first: string;

  /**
   * The middle name
   */
  @Prop() middle: string;

  /**
   * The last name
   */
  @Prop() last: string;

  private getText(): string {
    return format(this.first, this.middle, this.last);
  }

  genPdf(){
    // Default export is a4 paper, portrait, using millimeters for units
    console.log('genPdf()')
    var doc = new jsPDF()

    doc.text('Hello world!', 10, 10);
    doc.save('a4.pdf')
  }

  render() {
    return <div>Hello, World! I'm {this.getText()}
      <button onClick={this.genPdf}> PDF! </button>
    </div>;
  }
}
