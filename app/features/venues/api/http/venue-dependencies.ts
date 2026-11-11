import { apiClient } from "~/lib/api-client";

import { createHttpVenueGateway } from "./http-venue-gateway";
import { createHttpVenueReader } from "./http-venue-reader";

export const httpVenueGateway = createHttpVenueGateway(apiClient);

export const httpVenueReader = createHttpVenueReader(apiClient);
