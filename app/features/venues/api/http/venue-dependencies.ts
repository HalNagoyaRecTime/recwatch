import { apiClient } from "~/lib/api-client";

import { createHttpVenueGateway } from "./http-venue-gateway";

export const httpVenueGateway = createHttpVenueGateway(apiClient);
