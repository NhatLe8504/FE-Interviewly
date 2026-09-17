import { baseApi } from "./baseApi";
import type {
  StartSessionIn,
  SessionOut,
  TurnSubmitIn,
  TurnOut,
  RubricEvaluationOut,
  SessionResultOut,
} from "@/types/interview";
import type {
  CatalogDomain,
  CatalogRole,
  SubscriptionQuota,
  StartSessionPayload,
  SessionResponse,
  SubmitTurnPayload,
} from "@/services/interviewApi";

export const interviewApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDomains: builder.query<CatalogDomain[], void>({
      query: () => "/api/v1/catalog/domains",
      providesTags: ["Catalog"],
    }),

    getRoles: builder.query<CatalogRole[], number | string | undefined>({
      query: (domainId) =>
        domainId
          ? `/api/v1/catalog/roles?domain_id=${domainId}`
          : "/api/v1/catalog/roles",
      providesTags: ["Catalog"],
    }),

    checkSubscriptionQuota: builder.query<SubscriptionQuota, void>({
      query: () => "/api/v1/subscriptions/me",
      providesTags: ["Quota", "Subscription"],
    }),

    startSession: builder.mutation<
      SessionOut | SessionResponse,
      StartSessionIn | StartSessionPayload
    >({
      query: (body) => ({
        url: "/api/v1/interviews/sessions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Session", "Quota"],
    }),

    getSession: builder.query<SessionOut | SessionResponse, string | number>({
      query: (sessionId) => `/api/v1/interviews/sessions/${sessionId}`,
      providesTags: (_result, _err, id) => [{ type: "Session", id }],
    }),

    submitTurn: builder.mutation<
      TurnOut | any,
      {
        sessionId: string | number;
        data: TurnSubmitIn | SubmitTurnPayload;
      }
    >({
      query: ({ sessionId, data }) => {
        if (data.audio_blob) {
          const formData = new FormData();
          formData.append("answer_text", data.answer_text);
          formData.append("duration_seconds", String(data.duration_seconds));
          formData.append("audio_file", data.audio_blob, "answer.webm");
          return {
            url: `/api/v1/interviews/sessions/${sessionId}/turns`,
            method: "POST",
            body: formData,
          };
        }
        return {
          url: `/api/v1/interviews/sessions/${sessionId}/turns`,
          method: "POST",
          body: {
            answer_text: data.answer_text,
            duration_seconds: data.duration_seconds,
          },
        };
      },
      invalidatesTags: (_result, _err, { sessionId }) => [
        { type: "Session", id: sessionId },
      ],
    }),

    getTurnEvaluation: builder.query<
      RubricEvaluationOut,
      { sessionId: string | number; turnId: string }
    >({
      query: ({ sessionId, turnId }) =>
        `/api/v1/interviews/sessions/${sessionId}/turns/${turnId}/evaluation`,
    }),

    getSessionResult: builder.query<SessionResultOut, string | number>({
      query: (sessionId) => `/api/v1/interviews/sessions/${sessionId}/result`,
      providesTags: (_result, _err, id) => [{ type: "Session", id }, "Analytics"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDomainsQuery,
  useGetRolesQuery,
  useCheckSubscriptionQuotaQuery,
  useStartSessionMutation,
  useGetSessionQuery,
  useSubmitTurnMutation,
  useGetTurnEvaluationQuery,
  useGetSessionResultQuery,
  useLazyGetSessionResultQuery,
} = interviewApiSlice;