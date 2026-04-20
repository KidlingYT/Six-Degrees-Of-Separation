import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  ContactMetadata,
  ContactMetadataData,
  ContactMetadataPatch,
  ContactMetadataQuery
} from './contact-metadata.schema'

export type { ContactMetadata, ContactMetadataData, ContactMetadataPatch, ContactMetadataQuery }

export interface ContactMetadataParams extends MongoDBAdapterParams<ContactMetadataQuery> {}

export class ContactMetadataService<ServiceParams extends Params = ContactMetadataParams> extends MongoDBService<
  ContactMetadata,
  ContactMetadataData,
  ContactMetadataParams,
  ContactMetadataPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('contact-metadata'))
  }
}
