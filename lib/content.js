// @flow

/*::
export type Paragraph = {
  type: 'paragraph',
  text: Array<string>
};

*/
class ContentGenerator {
  static license() /*: Paragraph */ {
    return ContentGenerator.paragraph('foo bar');
  }

  static paragraph(text /*: string */) /*: Paragraph */ {
    return {
      type: 'paragraph',
      text: [text]
    };
  }

  static badges() /*: Paragraph */ {
    return ContentGenerator.paragraph('BADGES!!!');
  }
}

module.exports = {
  ContentGenerator
};
