import {
  Query,
  QueryAllowanceRequest,
  QueryAllowanceResponse,
  QueryAllowancesRequest,
  QueryAllowancesResponse,
} from "../grpc_gateway/cosmos/feegrant/v1beta1/query.pb";

export class FeegrantQuerier {
  constructor(private url: string) {}

  allowance(
    req: QueryAllowanceRequest,
    headers?: HeadersInit,
  ): Promise<QueryAllowanceResponse> {
    return Query.Allowance(req, {
      headers,
      pathPrefix: this.url,
    });
  }

  allowances(
    req: QueryAllowancesRequest,
    headers?: HeadersInit,
  ): Promise<QueryAllowancesResponse> {
    return Query.Allowances(req, {
      headers,
      pathPrefix: this.url,
    });
  }
}
