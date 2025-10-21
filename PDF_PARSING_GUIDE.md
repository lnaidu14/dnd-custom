# PDF Character Sheet Parsing

## Current Implementation
- Basic filename-based extraction
- Detects "Lala" in filename and creates sample character
- Provides guidance for fillable PDFs

## For Full PDF Parsing Support

### Install PDF.js Library
```bash
npm install pdfjs-dist
```

### Example Implementation
```javascript
import * as pdfjsLib from 'pdfjs-dist';

const parsePDFFormFields = async (arrayBuffer) => {
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1);
  
  // Extract form fields
  const annotations = await page.getAnnotations();
  const formData = {};
  
  annotations.forEach(annotation => {
    if (annotation.fieldName && annotation.fieldValue) {
      formData[annotation.fieldName] = annotation.fieldValue;
    }
  });
  
  return formData;
};
```

### D&D 5e Character Sheet Field Mapping
```javascript
const mapPDFToCharacter = (formData) => {
  return {
    name: formData['CharacterName'] || formData['Name'],
    class: formData['ClassLevel'] || formData['Class'],
    race: formData['Race'],
    level: parseInt(formData['Level']) || 1,
    str: parseInt(formData['STR']) || 10,
    dex: parseInt(formData['DEX']) || 10,
    con: parseInt(formData['CON']) || 10,
    int: parseInt(formData['INT']) || 10,
    wis: parseInt(formData['WIS']) || 10,
    cha: parseInt(formData['CHA']) || 10,
    hp: parseInt(formData['HPMax']) || 8,
    ac: parseInt(formData['AC']) || 10,
    movementSpeed: parseInt(formData['Speed']) || 30
  };
};
```

## Current Workaround
1. Fill out your PDF completely
2. Save it with character name in filename
3. Import - app will detect name and create basic character
4. Manually adjust stats as needed
