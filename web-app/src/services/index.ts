// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import { contactMetadata } from './contact-metadata/contact-metadata'
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(contactMetadata)
  // All services will be registered here
}
