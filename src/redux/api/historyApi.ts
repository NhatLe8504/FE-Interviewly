import { baseApi } from "./baseApi";
import type {
  HistoryPageData,
  SessionDetailData,
  SessionResultData,
} from "@/types/analytics";
import type { HistoryQueryParams } from "@/services/historyApi";

export const historyApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInterviewHistory: builder.query<HistoryPageData, HistoryQueryParams | void>({
      query: (params = {}) => {
        const query = new URLSearchParams();
        if (params?.page) query.set("page", params.page.toString());
        if (params?.pageSize) query.set("page_size", params.pageSize.toString());
        if (params?.domainId) query.set("domain_id", params.domainId.toString());
        if (params?.roleId) query.set("role_id", params.roleId.toString());
        if (params?.mode) query.set("mode", params.mode);
        if (params?.status) query.set("status", params.status);

        const qs = query.toString();
        return qs ? `/api/v1/analytics/history?${qs}` : "/api/v1/analytics/history";
      },
      providesTags: ["History"],
    }),

    getSessionDetails: builder.query<SessionDetailData, number | string>({
      query: (sessionId) => `/api/v1/analytics/sessions/${sessionId}`,
      providesTags: (_result, _err, id) => [{ type: "Session", id }],
    }),

    getHistoricalSessionResult: builder.query<SessionResultData, number | string>({
      query: (sessionId) => `/api/v1/interviews/sessions/${sessionId}/result`,
      providesTags: (_result, _err, id) => [{ type: "Session", id }, "Analytics"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInterviewHistoryQuery,
  useGetSessionDetailsQuery,
  useGetHistoricalSessionResultQuery,
} = historyApiSlice;