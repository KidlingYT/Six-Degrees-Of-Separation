// Schemas and types for the contact-metadata service
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main schema — one row per (userId, appleContactId)
export const contactMetadataSchema = Type.Object(
  {
    _id: Type.String(),
    userId: Type.String(),
    appleContactId: Type.String(),
    tags: Type.Array(Type.String(), { default: [] }),
    notes: Type.Optional(Type.String()),
    createdAt: Type.Number(),
    updatedAt: Type.Number()
  },
  { $id: 'ContactMetadata', additionalProperties: false }
)
export type ContactMetadata = Static<typeof contactMetadataSchema>
export const contactMetadataResolver = resolve<ContactMetadata, HookContext>({})
export const contactMetadataExternalResolver = resolve<ContactMetadata, HookContext>({})

// Creation
export const contactMetadataDataSchema = Type.Pick(
  contactMetadataSchema,
  ['userId', 'appleContactId', 'tags', 'notes'],
  { $id: 'ContactMetadataData' }
)
export type ContactMetadataData = Static<typeof contactMetadataDataSchema>
export const contactMetadataDataValidator = getValidator(contactMetadataDataSchema, dataValidator)
export const contactMetadataDataResolver = resolve<ContactMetadata, HookContext>({
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now()
})

// Patch
export const contactMetadataPatchSchema = Type.Partial(
  Type.Pick(contactMetadataSchema, ['tags', 'notes']),
  { $id: 'ContactMetadataPatch' }
)
export type ContactMetadataPatch = Static<typeof contactMetadataPatchSchema>
export const contactMetadataPatchValidator = getValidator(contactMetadataPatchSchema, dataValidator)
export const contactMetadataPatchResolver = resolve<ContactMetadata, HookContext>({
  updatedAt: async () => Date.now()
})

// Query
export const contactMetadataQueryProperties = Type.Pick(contactMetadataSchema, [
  '_id',
  'userId',
  'appleContactId',
  'tags'
])
export const contactMetadataQuerySchema = Type.Intersect(
  [querySyntax(contactMetadataQueryProperties), Type.Object({}, { additionalProperties: false })],
  { additionalProperties: false }
)
export type ContactMetadataQuery = Static<typeof contactMetadataQuerySchema>
export const contactMetadataQueryValidator = getValidator(contactMetadataQuerySchema, queryValidator)
export const contactMetadataQueryResolver = resolve<ContactMetadataQuery, HookContext>({})
