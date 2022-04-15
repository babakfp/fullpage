/**
 * Full Page Scroll
 * @param _slider {String} ID of fp-slider
 * @param _options {Object}
 */
class Full_Page
{
	constructor(_slider='', _options={})
	{
    this.slider = _slider
    this.options = _options

		// Default Options Here:
		this.options.some_option = this.options.some_option || 'default'
		this.options.use_buttons_for_dots = this.options.use_buttons_for_dots || true

		this.throw_error_if_slider_arg_was_not_valid()
		this.slider = document.querySelector(`fp-slider#${this.slider}`)
		this.throw_error_if_slider_el_did_not_exist()
		
		// TODO: Validate
		this.slide_all = this.slider.querySelectorAll('fp-slide')
		this.throw_error_if_el_could_not_be_found(this.slide_all, 'fp-slide')

		this.slide_len = this.slide_all.length
		this.slide_active_index = 0

		this.prev_wheel_deltaY = Math.floor(window.scrollY)

		// this.allow = true

		// -------------------------------------------
		
		this.dots
		this.create_dots()
		this.dot_all = this.slider.querySelectorAll('.fp-dot')
		
		this.dot_all.forEach((dot, i) => {

			dot.querySelector('.fp-dot-action').addEventListener('click', _=> {
				this.dot_all.forEach(dot2 => dot2.classList.remove('active'))

				if ( ! dot.classList.contains('active') ) {
					dot.classList.add('active')
					this.slide_active_index = i
					this.set_slide_translateY()
				}
			})

		})
		
		this.on_wheel()
  }

	// -------------------------------------------
	
	// -------------------------------------------

	create_dots() {

		const nav = document.createElement('nav')
		nav.classList.add('fp-dots')
		
		const ul = document.createElement('ul')

		for (let i = 1; i <= this.slide_len; i++) {

			const li = document.createElement('li')
			li.classList.add('fp-dot')

			if (this.options.use_buttons_for_dots === true) {
	
				const button = document.createElement('button')
				button.classList.add('fp-dot-action')
				li.appendChild(button)
	
			} else {
	
				const a = document.createElement('a')
				a.classList.add('fp-dot-action')
				li.appendChild(a)
	
			}
	
			ul.appendChild(li)

		}

		nav.appendChild(ul)

		this.dots = nav
		this.slider.appendChild(this.dots)

	}

	on_wheel() {
		// window.addEventListener('scroll', e => {
		// 	console.log('scrolling')
		// })

		window.addEventListener('wheel', e => {
			console.log('wheel')

			// setTimeout(_=> {
			// 	if ( this.get_active_slide_el().offsetTop === this.get_el_translate_values(this.slider).y ) {
			// 		this.allow = true
			// 	}
			// }, 2000)

			// if ( this.allow ) {
				if (e.deltaY > 0) {
					this.scroll_to_next_slide()
				} else {
					this.scroll_to_prev_slide()
				}
				this.set_slide_translateY()
			// }

			// this.allow = false
		})
	}

	// -------------------------------------------

	set_slide_translateY() {
		return this.set_css_var('--fp-translateY', `-${this.get_active_slide_el().offsetTop}px`)
	}

	get_active_slide_el() {
		return this.slide_all[this.slide_active_index]
	}

	/* CSS Variable Stuff
	-------------------------
	*/

	/**
	 * Set CSS Variable to :root
	 * @param css_var_name {String}
	 * @param css_var_value {String}
	 */
	set_css_var(css_var_name, css_var_value) {
		return document.documentElement.style.setProperty(css_var_name, css_var_value)
	}

	/**
	 * Get CSS Variable value
	 * @param css_var_name {String}
	 */
	get_css_var(css_var_name) {
		return getComputedStyle(document.documentElement).getPropertyValue(css_var_name)
	}

	// -------------------------------------------

	scroll_to_next_slide() {
		if (this.slide_active_index < this.slide_len - 1) {
			this.slide_active_index += 1

			this.dot_all.forEach(dot2 => dot2.classList.remove('active'))
			this.dot_all[this.slide_active_index].classList.add('active')
		}
		// console.log(`ACTIVE_SLIDE: ${this.slide_active_index}`)
	}

	scroll_to_prev_slide() {
		if (this.slide_active_index > 0) {
			this.slide_active_index -= 1

			this.dot_all.forEach(dot2 => dot2.classList.remove('active'))
			this.dot_all[this.slide_active_index].classList.add('active')
		}
		// console.log(`ACTIVE_SLIDE: ${this.slide_active_index}`)
	}

	/* Throw Error
	-------------------------
	*/

	/**
	 * @parem el {Node|NodeList} QuerySelector
	 * @parem el_name {String}
	 */
	throw_error_if_el_could_not_be_found(el, el_name) {
		if ( el === null || el.length <= 0 ) {
			throw(
				Error(`The referenced ${el_name} element could not be found.`)
			)
		}
	}

	throw_error_if_slider_el_did_not_exist() {
		if ( this.slider === null ) {
			throw(
				Error('The referenced fp-slider element could not be found.')
			)
		}
	}

	throw_error_if_slider_arg_was_not_valid() {
		if ( this.slider === undefined || this.slider === null || this.slider === '' ) {
			throw(
				Error('The first argument(slider) of the Full_Page class is not valid.')
			)
		}
		if ( typeof this.slider !== 'string' ) {
			throw(
				Error('The first argument(slider) of the Full_Page class needs to be a type of string.')
			)
		}
	}

	// --------------------------------------------------

	/**
	 * Gets computed translate values
	 * @param {HTMLElement} element
	 * @returns {Object}
	 */
	get_el_translate_values(element) {
		const style = window.getComputedStyle(element)
		const matrix = style['transform'] || style.webkitTransform || style.mozTransform

		// No transform property. Simply return 0 values.
		if (matrix === 'none' || typeof matrix === 'undefined') {
			return {
				x: 0,
				y: 0,
				z: 0,
			}
		}

		// Can either be 2d or 3d transform
		const matrixType = matrix.includes('3d') ? '3d' : '2d'
		const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')

		// 2d matrices have 6 values
		// Last 2 values are X and Y.
		// 2d matrices does not have Z value.
		if (matrixType === '2d') {
			return {
				x: parseInt(matrixValues[4]),
				y: parseInt(matrixValues[5]),
				z: 0,
			}
		}

		// 3d matrices have 16 values
		// The 13th, 14th, and 15th values are X, Y, and Z
		if (matrixType === '3d') {
			return {
				x: parseInt(matrixValues[12]),
				y: parseInt(matrixValues[13]),
				z: parseInt(matrixValues[14]),
			}
		}
	}

}

window.addEventListener('load', _=> {
	new Full_Page('my-slider', {
		some_option: 'false',
	})
})
