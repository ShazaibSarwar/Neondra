from docx import Document
import sys

def read_docx(filename):
    doc = Document(filename)
    fullText = []
    
    for element in doc.element.body:
        if element.tag.endswith('p'):
            from docx.text.paragraph import Paragraph
            p = Paragraph(element, doc)
            if p.text.strip():
                fullText.append(p.text)
        elif element.tag.endswith('tbl'):
            from docx.table import Table
            t = Table(element, doc)
            for row in t.rows:
                row_data = []
                for cell in row.cells:
                    row_data.append(cell.text.strip().replace('\n', ' '))
                fullText.append(' | '.join(row_data))
            fullText.append('')
            
    return '\n'.join(fullText)

if __name__ == '__main__':
    text = read_docx(sys.argv[1])
    with open('srs_content_utf8.txt', 'w', encoding='utf-8') as f:
        f.write(text)
