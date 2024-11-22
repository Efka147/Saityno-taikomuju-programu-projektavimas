const failureCodes = {
    BadRequest: 400,
    UnprocessableRequest: 422,
    NotFound: 404,
};

const SucessCodes = {
    POST: 201,
    GET: 200,
    DELETE: { withBody: 200, withoutBody: 204 },
};

export const StatusCodes = {
    POST: {
        failure: failureCodes,
        success: SucessCodes.POST,
    },
    GET: {
        failure: failureCodes,
        success: SucessCodes.GET,
    },
    PUT: {
        failure: failureCodes,
        success: SucessCodes.POST,
    },
    DELETE: {
        failure: failureCodes,
        success: SucessCodes.DELETE,
    },
    AUTH: {
        Unauthorized: 401,
        Forbidden: 403,
        BadRequest: 400,
        UnprocessableEntry: 422,
        Logout: 200,
        AccessToken: 200,
        Renew: 200,
    },
};
