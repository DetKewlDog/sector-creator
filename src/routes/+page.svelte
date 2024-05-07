<script lang='ts'>
	import MapSector from '$lib/MapSector.svelte';
	import Sector from '$lib/Sector.svelte';
	import type { SectorProps } from '$lib/types';

	const angleCount = 25;
	const radiusCount = 10;

	const size = 1000;
	const mapRadius = size / 2;

	const angles = [...Array(angleCount).keys()];
	const radii  = [...Array(radiusCount).keys()];

	let selectedSectors: SectorProps[] = [];
	let mergedSectors: SectorProps[] = [];
	let exported: boolean = false;

	const checkIfSelected = (a1: number, a2: number, r1: number, r2: number) => {
		const index = selectedSectors.findIndex(x =>
			x.a1 === a1 && x.a2 === a2 && x.r1 == r1 && x.r2 === r2
		);
		return index !== -1;
	}

	const mergeSimilarLoop = (sector : SectorProps) : SectorProps => {
		let changed = true;

		while (([sector, changed] = mergeSimilar(sector))[1]);

		return sector;
	}

	const mergeSimilar = ({ a1, a2, r1, r2 } : SectorProps) : [SectorProps, boolean] => {
		let mergedByRadius = false;
		let mergedByAngles = false;

		const similarRadiusIndex = mergedSectors.findIndex(x => x.r1 === r1 && x.r2 === r2);

		if (similarRadiusIndex !== -1) {
			const similar = mergedSectors[similarRadiusIndex];

			// is on left of new sector
			if (similar.a1 === a2 || (a2 === angleCount - 1 && similar.a1 === 0)) {
				a2 = similar.a2;
				r1 = similar.r1;
				r2 = similar.r2;
				mergedByRadius = true;
			}
			// is on right of new sector
			else if (similar.a2 === a1 || (similar.a2 === angleCount - 1 && a1 === 0)) {
				a1 = similar.a1;
				r1 = similar.r1;
				r2 = similar.r2;
				mergedByRadius = true;
			}

			mergedByRadius && mergedSectors.splice(similarRadiusIndex, 1);
		}

		const similarAngleIndex = mergedSectors.findIndex(x => x.a1 === a1 && x.a2 === a2);

		if (similarAngleIndex !== -1) {
			const similar = mergedSectors[similarAngleIndex];

			// is below new sector
			if (similar.r1 === r2) {
				a1 = similar.a1;
				a2 = similar.a2;
				r2 = similar.r2;
				mergedByAngles = true;
			}
			// is above new sector
			else if (similar.r2 === r1) {
				a1 = similar.a1;
				a2 = similar.a2;
				r1 = similar.r1;
				mergedByAngles = true;
			}

			mergedByAngles && mergedSectors.splice(similarAngleIndex, 1);
		}

		return [{ a1, a2, r1, r2 }, mergedByRadius || mergedByAngles];
	}

	const onSelect = (a1: number, a2: number, r1: number, r2: number) => {
		const exactIndex = selectedSectors.findIndex(x =>
			x.a1 === a1 && x.a2 === a2 && x.r1 === r1 && x.r2 === r2
		);

		const oldSelectedSectors = exactIndex === -1
			? [...selectedSectors, { a1, a2, r1, r2 }]
			: selectedSectors.filter((_, index) => index !== exactIndex);

		selectedSectors = [];
		mergedSectors = [];

		for (let sector of oldSelectedSectors) {
			selectedSectors = [...selectedSectors, sector];
			sector = mergeSimilarLoop(sector);
			mergedSectors = [...mergedSectors, sector];
		}
	}

	let path: string;

	const showPath = (_path: string) => path = _path;
</script>

<div class='app'>
	<svg viewBox={`0 0 ${size} ${size}`} xmlns='http://www.w3.org/2000/svg'>
		{#key mergedSectors}
			{#if mergedSectors.length}
				<MapSector
					cells={mergedSectors}
					{mapRadius}
					{showPath}
					pointerEvents={exported ? 'default' : 'none'}
				/>
			{/if}
			{#if !exported}
				<Sector
					a1={0}
					a2={0}
					r1={0}
					r2={1}
					{mapRadius}
					{checkIfSelected}
					{onSelect}
				/>
				{#each angles.slice(0, -1) as angle, angleIndex}
					{#each radii.slice(0, -1) as radius, radiusIndex}
						<Sector
							a1={angle}
							a2={angles[angleIndex + 1 % angleCount]}
							r1={radius + 1}
							r2={radii[radiusIndex + 1] + 1}
							{mapRadius}
							{checkIfSelected}
							{onSelect}
						/>
					{/each}
				{/each}
			{/if}
		{/key}
	</svg>

	<img src='https://helldivers.io/img/helldivers_sectormap_wtr.webp' alt='sectors' />

	<div class='bottom-container'>
		{#if exported}
			<pre>
				<code>
					{`${JSON.stringify(mergedSectors)}\n\n<svg viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'>
					<path stroke-width='4px' paint-order='stroke'
						d='${path}'
					/>
					</svg>`}
				</code>
			</pre>
		{/if}
		<div class='button-container'>
			<button on:click={() => exported = !exported }>
				{exported ? 'Edit' : 'Export'}
			</button>
			<button on:click={() => { selectedSectors = []; mergedSectors = []; exported = false; } }>
				Reset
			</button>
		</div>
	</div>
</div>


<style>
	.app {
		display: flex;
		height: 100%;
	}

	svg {
		position: absolute;
		inset: 0;
		margin-inline: calc(50% - 320px);
		max-height: 640px;
	}
	img {
		max-width: 640px;
		max-height: 640px;
		position: absolute;
		inset: 0;
		margin-inline: calc(50% - 320px);
		pointer-events: none;
		user-select: none;
		opacity: 0.5;
	}

	.bottom-container {
		margin-inline: auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		margin-top: auto;
		margin-bottom: 0;
		row-gap: 12px;
	}
	pre, code {
		max-width: 600px;
		text-align: left;
		white-space: pre-line;
		word-wrap: break-word;
		z-index: 1000;
	}

	pre {
		background-color: rgba(128, 128, 128, 0.75);
		padding-inline: 12px;
		border-radius: 12px;
	}

	button {
		background-color: #334155;
		color: white;
		padding: 12px 24px;
		font-family: Arial, Helvetica, sans-serif;
		outline: none;
		border: none;
		border-radius: 8px;
		font-size: large;
		margin-inline: 3px;
	}

	button:hover {
		background-color: #64748b;
	}

	.button-container {
		margin-inline: auto; margin-bottom: 12px;
	}
</style>