// Local typedoc plugin: render viem-derived mega-types opaquely.
//
// The api factories are annotated with `TypedContract<…>` / `PublicClient` in
// source, but both resolve through viem conditional/mapped types, so typedoc
// expands them structurally — a single contract instance reflects to ~20k lines
// of generated markdown. This plugin swaps those known return/property types
// for the exact annotation text the source uses (readers follow `PublicClient`
// to viem's docs via externalSymbolLinkMappings; `TypedContract` has its own
// reference page). The map is small because the public surface is frozen
// (specs/SDK_SPECS.md §Public surface).
import { Converter, ReflectionKind, UnknownType } from 'typedoc';

const returnTypeOverrides = {
  getPublicClient: 'PublicClient',
  resolveClient: 'PublicClient',
  getTypedContract: 'TypedContract<A>',
  getWorldContract: 'TypedContract<(typeof contractAbis)[ContractName]>',
  getCardsContract: 'TypedContract<typeof contractAbis.CardsMinter>',
  getErc20: 'TypedContract<typeof erc20Abi>',
  getErc721: 'TypedContract<typeof erc721Abi>',
};

/** @param {import('typedoc').Application} app */
// The abandoned type-literal tree is removed from the project so its comments
// (viem-internal `{@link}`s) don't reach link validation. Safe in the
// single-project strategy — there is no per-package serialize/merge step left
// to hold dangling references.
const replaceType = (project, holder, text) => {
  const previous = holder.type;
  holder.type = new UnknownType(text);
  if (previous?.type === 'reflection' && previous.declaration) {
    project.removeReflection(previous.declaration);
  }
};

export function load(app) {
  app.converter.on(Converter.EVENT_RESOLVE_BEGIN, (context) => {
    const { project } = context;
    for (const signature of project.getReflectionsByKind(ReflectionKind.CallSignature)) {
      const text = returnTypeOverrides[signature.parent?.name];
      if (text) {
        replaceType(project, signature, text);
      }
    }
    // every caller-supplied viem client option (`client?: PublicClient`)
    for (const property of project.getReflectionsByKind(ReflectionKind.Property)) {
      if (property.name === 'client' && property.parent?.parent?.name === '@avante/crawler-api') {
        replaceType(project, property, 'PublicClient');
      }
    }
    // the ABI registry variable — its const-asserted literal type is the point
    // in code, but structurally rendered it is the entire 8-contract ABI
    for (const variable of project.getReflectionsByKind(ReflectionKind.Variable)) {
      if (variable.name === 'contractAbis') {
        replaceType(project, variable, 'Record<KnownContractName, Abi>');
      }
    }
  });
}
