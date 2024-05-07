export function getSectorPath(a1: number, a2: number, r1: number, r2: number, mapRadius: number) {
	a1 *= 15;
	a2 *= 15;

  r1 = Math.max(0, (r1 * 0.1 - 0.02) * mapRadius);
	r2 = Math.max(0, (r2 * 0.1 - 0.02) * mapRadius);

	if (a1 === 0 && a2 === 0) {
		// center sector
		return `M ${mapRadius + r2} ${mapRadius} A ${r2} ${r2} 0 1 1 ${mapRadius - r2} ${mapRadius} A ${r2} ${r2} 0 1 1 ${mapRadius + r2} ${mapRadius}`
	}

	function getAnglePosition(angle: number, radius: number) {
		const x = mapRadius + radius * Math.sin(angle);
		const y = mapRadius - radius * Math.cos(angle);
		return [x, y];
	}

	function getPath(radius: number, startAngle: number, sweepAngle: number, isInner: boolean) {
		startAngle *= Math.PI / 180;
		sweepAngle *= Math.PI / 180;

		const inner = isInner ? 1 : 0;
		const opcode = isInner ? 'M' : 'L';

		const [startX, startY] = getAnglePosition(startAngle, radius);
		const [endX, endY] = getAnglePosition(startAngle + sweepAngle, radius);

		const largeArc = sweepAngle >= 180 ? '1' : '0';

		return `${opcode} ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} ${inner} ${endX} ${endY}`;
	}

	return `${getPath(r1, 90 - a2, a2 - a1, true)} ${getPath(r2, 90 - a2 + a2 - a1, a1 - a2, false)}`;
}