declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;
	export type CollectionEntry<C extends keyof AnyEntryMap> = Flatten<AnyEntryMap[C]>;

	// TODO: Remove this when having this fallback is no longer relevant. 2.3? 3.0? - erika, 2023-04-04
	/**
	 * @deprecated
	 * `astro:content` no longer provide `image()`.
	 *
	 * Please use it through `schema`, like such:
	 * ```ts
	 * import { defineCollection, z } from "astro:content";
	 *
	 * defineCollection({
	 *   schema: ({ image }) =>
	 *     z.object({
	 *       image: image(),
	 *     }),
	 * });
	 * ```
	 */
	export const image: never;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"archive": {
"burro-salvia.md": {
	id: "burro-salvia.md";
  slug: "burro-salvia";
  body: string;
  collection: "archive";
  data: any
} & { render(): Render[".md"] };
"kantjil-tijger.md": {
	id: "kantjil-tijger.md";
  slug: "kantjil-tijger";
  body: string;
  collection: "archive";
  data: any
} & { render(): Render[".md"] };
};
"blog": {
"14-architectural-design-ideas-for-spacious-interior.md": {
	id: "14-architectural-design-ideas-for-spacious-interior.md";
  slug: "14-architectural-design-ideas-for-spacious-interior";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"complete-guide-fullstack-development.md": {
	id: "complete-guide-fullstack-development.md";
  slug: "complete-guide-fullstack-development";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"essential-data-structures-algorithms.md": {
	id: "essential-data-structures-algorithms.md";
  slug: "essential-data-structures-algorithms";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"every-next-level-of-your-life-will-demand-a-different-you.md": {
	id: "every-next-level-of-your-life-will-demand-a-different-you.md";
  slug: "every-next-level-of-your-life-will-demand-a-different-you";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"how-to-become-frontend-master.md": {
	id: "how-to-become-frontend-master.md";
  slug: "how-to-become-frontend-master";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"nothing-new-about-undermining-women-autonomy.md": {
	id: "nothing-new-about-undermining-women-autonomy.md";
  slug: "nothing-new-about-undermining-women-autonomy";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"template.md": {
	id: "template.md";
  slug: "template";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"this-bread-pudding-will-give-you-all-the-fall-feels.md": {
	id: "this-bread-pudding-will-give-you-all-the-fall-feels.md";
  slug: "this-bread-pudding-will-give-you-all-the-fall-feels";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};
"guides": {
"amsterdam.md": {
	id: "amsterdam.md";
  slug: "amsterdam";
  body: string;
  collection: "guides";
  data: InferEntrySchema<"guides">
} & { render(): Render[".md"] };
"guidetemplate.md": {
	id: "guidetemplate.md";
  slug: "guidetemplate";
  body: string;
  collection: "guides";
  data: InferEntrySchema<"guides">
} & { render(): Render[".md"] };
"london.md": {
	id: "london.md";
  slug: "london";
  body: string;
  collection: "guides";
  data: InferEntrySchema<"guides">
} & { render(): Render[".md"] };
"nyc.md": {
	id: "nyc.md";
  slug: "nyc";
  body: string;
  collection: "guides";
  data: InferEntrySchema<"guides">
} & { render(): Render[".md"] };
"paris.md": {
	id: "paris.md";
  slug: "paris";
  body: string;
  collection: "guides";
  data: InferEntrySchema<"guides">
} & { render(): Render[".md"] };
};
"tips": {
"10-cases.md": {
	id: "10-cases.md";
  slug: "10-cases";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"bistrotheque.md": {
	id: "bistrotheque.md";
  slug: "bistrotheque";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"bob-bob-ricard.md": {
	id: "bob-bob-ricard.md";
  slug: "bob-bob-ricard";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"brawn.md": {
	id: "brawn.md";
  slug: "brawn";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"bubala.md": {
	id: "bubala.md";
  slug: "bubala";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"buffet-odette.md": {
	id: "buffet-odette.md";
  slug: "buffet-odette";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"bunbunbun.md": {
	id: "bunbunbun.md";
  slug: "bunbunbun";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"chez-janou.md": {
	id: "chez-janou.md";
  slug: "chez-janou";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"coming-soon.md": {
	id: "coming-soon.md";
  slug: "coming-soon";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"dejaren.md": {
	id: "dejaren.md";
  slug: "dejaren";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"dishoom.md": {
	id: "dishoom.md";
  slug: "dishoom";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"fontaine-de-mars.md": {
	id: "fontaine-de-mars.md";
  slug: "fontaine-de-mars";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"joes-shanghai.md": {
	id: "joes-shanghai.md";
  slug: "joes-shanghai";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"joia.md": {
	id: "joia.md";
  slug: "joia";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"koffie-salon.md": {
	id: "koffie-salon.md";
  slug: "koffie-salon";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"le-petit-marche.md": {
	id: "le-petit-marche.md";
  slug: "le-petit-marche";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"little-collins.md": {
	id: "little-collins.md";
  slug: "little-collins";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"luxembourg.md": {
	id: "luxembourg.md";
  slug: "luxembourg";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"made-warung.md": {
	id: "made-warung.md";
  slug: "made-warung";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"maison-premiere.md": {
	id: "maison-premiere.md";
  slug: "maison-premiere";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"manhatta.md": {
	id: "manhatta.md";
  slug: "manhatta";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"mexico-2000.md": {
	id: "mexico-2000.md";
  slug: "mexico-2000";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"nopi.md": {
	id: "nopi.md";
  slug: "nopi";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"padella.md": {
	id: "padella.md";
  slug: "padella";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"parsons.md": {
	id: "parsons.md";
  slug: "parsons";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"pastis.md": {
	id: "pastis.md";
  slug: "pastis";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"pique-nique.md": {
	id: "pique-nique.md";
  slug: "pique-nique";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"pisellino.md": {
	id: "pisellino.md";
  slug: "pisellino";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"pizzabakkers.md": {
	id: "pizzabakkers.md";
  slug: "pizzabakkers";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"pophams.md": {
	id: "pophams.md";
  slug: "pophams";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"relais-venise.md": {
	id: "relais-venise.md";
  slug: "relais-venise";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"rijks.md": {
	id: "rijks.md";
  slug: "rijks";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"sadelles.md": {
	id: "sadelles.md";
  slug: "sadelles";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"sessions-arts-club.md": {
	id: "sessions-arts-club.md";
  slug: "sessions-arts-club";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"shuka.md": {
	id: "shuka.md";
  slug: "shuka";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"sketch.md": {
	id: "sketch.md";
  slug: "sketch";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"tiptemplate.md": {
	id: "tiptemplate.md";
  slug: "tiptemplate";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"van-dobben.md": {
	id: "van-dobben.md";
  slug: "van-dobben";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"vleminckx.md": {
	id: "vleminckx.md";
  slug: "vleminckx";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"wilmington.md": {
	id: "wilmington.md";
  slug: "wilmington";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"winkel-34.md": {
	id: "winkel-34.md";
  slug: "winkel-34";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
"ysbreeker.md": {
	id: "ysbreeker.md";
  slug: "ysbreeker";
  body: string;
  collection: "tips";
  data: InferEntrySchema<"tips">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
