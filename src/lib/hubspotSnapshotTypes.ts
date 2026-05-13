export type HubspotSnapshotEntityStatus = 'available' | 'unavailable' | 'missing_scope' | 'error' | 'not_implemented';
export type HubspotSnapshotCountKind = 'real_total' | 'sample' | 'not_available' | 'not_implemented';
export type HubspotSnapshotPropertyStatus = 'available' | 'missing_scope' | 'not_configured' | 'error';

export interface HubspotSnapshotEntity {
  objectType: string;
  label: string;
  status: HubspotSnapshotEntityStatus;
  hubspotTotalCount: number | null;
  canopiTaggedCount: number | null;
  canopiBatchCount: number | null;
  outsideCanopiCount: number | null;
  count: number | null;
  sampleCount: number | null;
  countKind: HubspotSnapshotCountKind;
  canopiTagStatus?: HubspotSnapshotPropertyStatus;
  canopiBatchStatus?: HubspotSnapshotPropertyStatus;
  lastCheckedAt: string;
  errorMessage: string | null;
  scopeRequired: string | null;
  source: 'hubspot';
  sourceEndpoint?: string | null;
  note?: string | null;
}

export interface HubspotSnapshotResult {
  status: 'success' | 'error';
  provider: 'hubspot';
  loadedAt: string;
  entities: HubspotSnapshotEntity[];
  error?: string;
}
