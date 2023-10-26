import {
	WHITE,
	angleBetween,
	distanceBetween,
	rotate,
	subtract,
} from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { createWire } from "../../../nogan/nogan.js"
import { Dom } from "../../components/dom.js"
import { Tunnel } from "../../components/tunnel.js"
import { Entity } from "../entity.js"
import { Line } from "../shapes/line.js"
import { Triangle } from "../shapes/triangle.js"
import { ControlWire } from "./control-wire.js"

export class DummyTime extends Entity {
	/**
	 *
	 * @param {{
	 * 	id?: WireId
	 *  target: Entity & {dom: Dom, tunnel: Tunnel}
	 *  source: Entity & {dom: Dom, tunnel: Tunnel}
	 *  timing: Timing
	 * }} options
	 */
	constructor({ id, target, source, timing = 0 }) {
		super()

		// Attach components
		this.dom = this.attach(
			new Dom({
				id: "dummy-time",
				type: "html",
			}),
		)
		this.source = source
		this.target = target

		// Setup tunnel
		if (id === undefined) {
			const { wire, operations } = createWire(shared.nogan, {
				source: source.tunnel.id,
				target: target.tunnel.id,
				timing,
			})

			this.tunnel = this.attach(new Tunnel(wire.id, { entity: this }))
			Tunnel.apply(() => operations)
		} else {
			this.tunnel = this.attach(new Tunnel(id, { entity: this }))
		}

		// Render elements
		this.line = this.attach(new Line())
		this.flaps = this.attach(new ControlWire({ wire: this.tunnel.id }))
		this.dom.append(this.line.dom)
		this.dom.append(this.flaps.dom)

		// Style elements
		this.flaps.dom.style.fill.set(WHITE.toString())
		this.flaps.dom.transform.scale.set([2 / 3, 2 / 3])

		this.use(() => {
			const sourcePosition = this.source.dom.transform.absolutePosition.get()
			const targetPosition = this.target.dom.transform.absolutePosition.get()
			const distance = distanceBetween(sourcePosition, targetPosition)
			const middleDistance = distance / 2

			const angle = angleBetween(sourcePosition, targetPosition)
			const middleDisplacement = rotate([middleDistance, 0], angle)
			const middle = subtract(sourcePosition, middleDisplacement)

			this.line.dom.transform.setAbsolutePosition(sourcePosition)
			this.line.target.setAbsolutePosition(targetPosition)

			this.flaps.dom.transform.setAbsolutePosition(middle)
			this.flaps.dom.transform.rotation.set(angle + Math.PI / 2)
		}, [this.target.dom.transform.absolutePosition, this.source.dom.transform.absolutePosition])
	}
}