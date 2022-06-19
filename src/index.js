/**
 * Full Page Scroll
 * @param _slider_node {HTMLElement} Main element
 * @param _options {Object}
 */
class Full_Page
{
	constructor(_slider_node, _options={})
	{
		this.slider_node = _slider_node
		this.options = _options

		// Default Options Here:
		this.options.some_option = this.options.some_option || 'default'
		this.options.use_buttons_for_dots = this.options.use_buttons_for_dots || true
		this.options.allow_free_scroll = this.options.allow_free_scroll || false

		this.validating_constructor_slider_node()
		this.validating_constructor_options()
		
		// TODO: Validate
		this.slide_nodes = this.slider_node.querySelectorAll('.fp-slide')
		this.throw_error_if_el_could_not_be_found(this.slide_nodes, '.fp-slide')

		this.active_slide_index = 0

		// -------------------------------------------
		
		this.dots_el
		this.create_dots()
		this.dot_nodes = this.slider_node.querySelectorAll('.fp-dot')

		this.dot_nodes.forEach((dot, i) => {

			dot.querySelector('.fp-dot-action').addEventListener('click', _=> {
				this.dot_nodes.forEach(dot2 => dot2.classList.remove('active'))

				if ( ! dot.classList.contains('active') ) {
					dot.classList.add('active')
					this.active_slide_index = i
					this.set_slide_translateY()
				}
			})

		})

		this.allow_scroll = true

		// ------------------------------

		this.on_scroll()

    // Fix position when height resize
    window.addEventListener('resize', _=> this.set_slide_translateY())
  }

  fix_scroll_position_on_window_resize() {
    
  }

	// Gets the values based on is the element in the viewport
	rect_values (el) {
    const rect = el.getBoundingClientRect()

    return {
			top: Math.floor(rect.top),
			right: Math.floor(rect.right),
			bottom: Math.floor(rect.bottom),
			left: Math.floor(rect.left),
    }
	}

	// -------------------------------------------
	
	on_scroll() {
		this.slider_node.addEventListener('wheel', e => {

			if (this.allow_free_scroll === true) {

				this.do_scroll_stuff(e)
			
			} else if (this.allow_scroll) {

				this.allow_scroll = false
				this.do_scroll_stuff(e)
	
				setTimeout(_=> {
					this.allow_scroll = true
				}, this.get_scroll_speed_for_allow_scroll())

			}

		})
	}

	/**
	 * We don't want to user be able to do the next scroll after the exact amount of time of the transition duration because then user may try to scroll again, 1 second before the duration actualy ends. So we don't want that bad UX and brokenness.
	 * 10%  | xx?
	 * 100% | 1000ms
	 */
	get_scroll_speed_for_allow_scroll() {
		const speedCssVar = this.get_css_var('--fp-scroll-speed')
		const speed = speedCssVar.substring(0, speedCssVar.length - 2)
    return speed * 90 / 100
	}

	do_scroll_stuff(e) {
		if (e.deltaY > 0) {
			this.scroll_to_next_slide()
		} else {
			this.scroll_to_prev_slide()
		}
		this.set_slide_translateY()
	}

	// -------------------------------------------

	set_slide_translateY() {
		return this.set_css_var('--fp-translateY', `-${this.active_slide_index * window.innerHeight}px`)
	}

	get_active_slide_el() {
		return this.slide_nodes[this.active_slide_index]
	}

	// -------------------------------------------

	update_dots_activeness() {
    this.dot_nodes.forEach(dot => dot.classList.remove('active'))
		this.dot_nodes[this.active_slide_index].classList.add('active')
	}

	scroll_to_next_slide() {
		if (this.active_slide_index < this.slide_nodes.length - 1) {
			this.active_slide_index += 1

			this.update_dots_activeness()
		}
		// console.log(`ACTIVE_SLIDE: ${this.active_slide_index}`)
	}

	scroll_to_prev_slide() {
		if (this.active_slide_index > 0) {
			this.active_slide_index -= 1

			this.update_dots_activeness()
		}
		// console.log(`ACTIVE_SLIDE: ${this.active_slide_index}`)
	}

	// --------------------------------------------

	create_dots() {

		const nav = document.createElement('nav')
		nav.classList.add('fp-dots')
		
		const ul = document.createElement('ul')

		for (let i = 1; i <= this.slide_nodes.length; i++) {

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

		this.dots_el = nav
		this.slider_node.appendChild(this.dots_el)

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

	/**
	 * Gets computed translate values
	 * @param element {HTMLElement}
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

  is_element(obj) {
    try {
      // Using W3 DOM2 (works for FF, Opera and Chrome)
      return obj instanceof HTMLElement
    }
    catch(e){
      // Browsers not supporting W3 DOM2 don't have HTMLElement and
      // an exception is thrown and we end up here. Testing some
      // properties that all elements have (works on IE7)
      return (typeof obj==='object') &&
        (obj.nodeType===1) && (typeof obj.style === 'object') &&
        (typeof obj.ownerDocument ==='object')
    }
  }

  /** */
	validating_constructor_slider_node() {
    
    if ( typeof this.slider_node === 'undefined' ) {
			throw( Error(`The first argument ("slider") in the "Full_Page" class, is REQUIRED.`) )
    }

    if ( !this.is_element(this.slider_node) ) {
			throw( Error(`The first argument ("slider") in the "Full_Page" class, is INVALID or is not a type of element, or it doesn't exist.`) )
    }
    
    if ( !this.slider_node.classList.contains('fp-slider') ) {
			throw( Error(`The first argument ("slider") in the "Full_Page" class, must contain the "fp-slider" calss.`) )
    }
    
	}

  validating_constructor_options() {

    if ( typeof this.options !== 'object' ) {
			throw( Error(`The second argument ("option") in the "Full_Page" class, must be a type of object.`) )
    }

  }

}
