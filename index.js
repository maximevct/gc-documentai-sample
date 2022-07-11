const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1
const fs = require('fs').promises
const path = require('path')
require('dotenv').config()

const BSP = require('./bank-statement-parser')
const extractor = require('./config.json')['OCR']

const client = new DocumentProcessorServiceClient({
  apiEndpoint: process.env.GC_API_ENDPOINT
})

const endpoint = `projects/${process.env.GC_ID_PROJECT}/locations/${process.env.GC_PROCESSOR_LOCATION}/processors/${extractor.id}`

const main = async (av) => {
  const imageFile = await fs.readFile(av[0])
  const encodedImage = Buffer.from(imageFile).toString('base64')  
  const request = {
    name : endpoint,
    rawDocument: {
      content: encodedImage,
      mimeType: 'application/pdf',
    }
  }
  try {
    const [result] = await client.processDocument(request)
    console.log('Document processing complete.')
    const {document} = result
    await fs.writeFile(`${extractor.name}-${path.basename(av[0])}-res.json`, JSON.stringify(document))
    const data = BSP.parse(document)
    await fs.writeFile(`${extractor.name}-${path.basename(av[0])}-res-parsed.json`, JSON.stringify(data))
  } catch (err) {
    console.log(`Error : ${err}`)
  }
}

main(process.argv.slice(2))