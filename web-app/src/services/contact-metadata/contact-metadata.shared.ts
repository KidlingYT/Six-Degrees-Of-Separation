import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  ContactMetadata,
  ContactMetadataData,
  ContactMetadataPatch,
  ContactMetadataQuery,
  ContactMetadataService
} from './contact-metadata.class'

export type { ContactMetadata, ContactMetadataData, ContactMetadataPatch, ContactMetadataQuery }

export type ContactMetadataClientService = Pick<
  ContactMetadataService<Params<ContactMetadataQuery>>,
  (typeof contactMetadataMethods)[number]
>

export const contactMetadataPath = 'contact-metadata'
export const contactMetadataMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const contactMetadataClient = (client: ClientApplication) => {
  const connection = client.get('connection')
  client.use(contactMetadataPath, connection.service(contactMetadataPath), {
    methods: contactMetadataMethods
  })
}

declare module '../../client' {
  interface ServiceTypes {
    [contactMetadataPath]: ContactMetadataClientService
  }
}
