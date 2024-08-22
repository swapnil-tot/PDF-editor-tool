# @swapnil-tot/pdf-editor

`@swapnil-tot/pdf-editor` is a React component library designed to facilitate PDF editing and manipulation. It offers tools for rotating, cropping, and rearranging PDF pages within a React application.

## Features

- **Rotate PDF Pages**: Rotate selected PDF pages by specified angles.
- **Crop PDF Pages**: Crop selected pages with a visual cropper tool.
- **Reorder Pages**: Drag and drop pages to reorder them.
- **Preview Pages**: View and interact with PDF pages as images.

## Installation

### 1. Install the Package

You can add `@swapnil-tot/pdf-editor` to your project using npm or yarn:

npm install @swapnil-tot/pdf-editor
or
yarn add @swapnil-tot/pdf-editor


### 2. Install Peer Dependencies

it relies on several peer dependencies. To ensure proper functionality, install the following dependencies in your project:

npm install react@^17.0.0 react-dom@^17.0.0 pdf-lib@^1.17.0 pdfjs-dist@^2.16.0 react-beautiful-dnd@^13.1.0 react-cropper@^1.5.0 cropperjs@^1.5.12 @mui/material@^5.7.0 @mui/icons-material@^5.7.0
or
yarn add react@^17.0.0 react-dom@^17.0.0 pdf-lib@^1.17.0 pdfjs-dist@^2.16.0 react-beautiful-dnd@^13.1.0 react-cropper@^1.5.0 cropperjs@^1.5.12 @mui/material@^5.7.0 @mui/icons-material@^5.7.0

### Usage

### 1. Add .npmrc file in your project

@swapnil-tot:registry="https://npm.pkg.github.com"
//npm.pkg.github.com/:_authToken=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

### 2. Import and Use the PdfTool Component

```
import React from 'react';
import { PdfTool } from '@swapnil-tot/pdf-editor';

const App = () => {
  return (
    <div>
      <PdfTool
        pdfData={[
          {
            stepNumber: 0,
            pageCount: 1,
            startFrom: 0,
            fieldPDF: 'https://example.com/step_GENERATED_PDF_0_signature.pdf',
            pdfName: 'signature',
            fieldOriginalPDF: 'https://example.com/step_GENERATED_PDF_0_signature_ORIGINAL.pdf',
          },
          {
            stepNumber: 2,
            pageCount: 3,
            startFrom: 1,
            fieldPDF: 'https://example.com/step_GENERATED_PDF_2_file.pdf',
            pdfName: 'file',
            fieldOriginalPDF: 'https://example.com/step_GENERATED_PDF_2_file_ORIGINAL.pdf',
          },
        ]}
        pdfFile='https://example.com/step_GENERATED_PDF.pdf'
        oldPdf='https://example.com/step_GENERATED_PDF.pdf'
      />
    </div>
  );
};

export default App;
``````

