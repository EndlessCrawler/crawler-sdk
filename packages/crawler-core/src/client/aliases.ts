/**
 * Per-schema type aliases (see `SDK_SPECS.md` §Type-system rules): every public
 * schema-generic type ships a per-schema alias beside the descriptors, so
 * consumers never write `<typeof ec>` in annotations. They pair with
 * `crawler-react`'s per-schema hook aliases (`useWorldEC`, ...).
 */
import type { ChamberData } from '../chamber/chamber';
import type { cnc } from '../schema/schema.cnc';
import type { ec } from '../schema/schema.ec';
import type { Chamber, WorldHandle } from './crawler';

/** an `ec` world's {@link WorldHandle} */
export type WorldHandleEC = WorldHandle<typeof ec>;
/** a `cnc` world's {@link WorldHandle} */
export type WorldHandleCC = WorldHandle<typeof cnc>;

/** an `ec` world's {@link Chamber} */
export type ChamberEC = Chamber<typeof ec>;
/** a `cnc` world's {@link Chamber} */
export type ChamberCC = Chamber<typeof cnc>;

/** an `ec` chamber's stored record */
export type ChamberDataEC = ChamberData<typeof ec>;
/** a `cnc` chamber's stored record */
export type ChamberDataCC = ChamberData<typeof cnc>;
