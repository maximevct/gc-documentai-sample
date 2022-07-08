const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1
const fs = require('fs').promises
require('dotenv').config()

const extractor = require('./config.json')['OCR']

const client = new DocumentProcessorServiceClient({
  apiEndpoint: process.env.API_ENDPOINT
})

const endpoint = `projects/${process.env.GC_ID_PROJECT}/locations/${GC_PROCESSOR_LOCATION}/processors/${extractor.id}`

const display_data = data => {
  data.pages.map(displayPage)
  data.entities.map(displayEntity)
}
const displayEntity = entity => {
  console.log('Entity')
  entity.properties.length 
  ? entity.properties.map(displayEntity)
  : displayText(entity)
}
const displayText = text => {
  console.log(`Type = ${text.type}
  Content = ${text.mentionText}
  Confidence = ${text.confidence.toFixed(2)}`)
}
const displayPage = page => page.formFields.map(displayForm)
const displayForm = form => {
  console.table([{
    confidence : form.fieldName.confidence * 100,
    field : form.fieldName.textAnchor.content,
    value : form.fieldValue.textAnchor.content
  }], ['confidence', 'field', 'value'])
}

const main = async (av) => {
  const imageFile = await fs.readFile(av[0])
  const encodedImage = Buffer.from(imageFile).toString('base64')  
  const request = {
    name : endpoint,
    rawDocument: {
      content: encodedImage,
      mimeType: 'application/pdf',
    },
  }
  try {
    const [result] = await client.processDocument(request)
    console.log('Document processing complete.')
    const {document} = result
    // await fs.writeFile('toto2.json', JSON.stringify(document))
    // display_data(document)
    console.log(document.text)
  } catch (err) {
    console.log(`Error : ${err}`)
  }
}

main(process.argv.slice(2))