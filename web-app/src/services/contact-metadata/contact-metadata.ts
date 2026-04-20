import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  contactMetadataDataValidator,
  contactMetadataPatchValidator,
  contactMetadataQueryValidator,
  contactMetadataResolver,
  contactMetadataExternalResolver,
  contactMetadataDataResolver,
  contactMetadataPatchResolver,
  contactMetadataQueryResolver
} from './contact-metadata.schema'

import type { Application } from '../../declarations'
import { ContactMetadataService, getOptions } from './contact-metadata.class'
import { contactMetadataPath, contactMetadataMethods } from './contact-metadata.shared'

export * from './contact-metadata.class'
export * from './contact-metadata.schema'

export const contactMetadata = (app: Application) => {
  app.use(contactMetadataPath, new ContactMetadataService(getOptions(app)), {
    methods: contactMetadataMethods,
    events: []
  })

  // Ensure uniqueness of (userId, appleContactId)
  app
    .get('mongodbClient')
    .then(db =>
      db.collection('contact-metadata').createIndex({ userId: 1, appleContactId: 1 }, { unique: true })
    )
    .catch(err => console.error('contact-metadata index error', err))

  app.service(contactMetadataPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(contactMetadataExternalResolver),
        schemaHooks.resolveResult(contactMetadataResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(contactMetadataQueryValidator),
        schemaHooks.resolveQuery(contactMetadataQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(contactMetadataDataValidator),
        schemaHooks.resolveData(contactMetadataDataResolver)
      ],
      patch: [
        schemaHooks.validateData(contactMetadataPatchValidator),
        schemaHooks.resolveData(contactMetadataPatchResolver)
      ],
      remove: []
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [contactMetadataPath]: ContactMetadataService
  }
}
