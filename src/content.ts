// @flow

export type Paragraph = {
  type: 'paragraph';
  text: Array<string>;
};

export class ContentGenerator {
  static paragraph(text: string): Paragraph {
    return {
      type: 'paragraph',
      text: [text],
    };
  }
}
