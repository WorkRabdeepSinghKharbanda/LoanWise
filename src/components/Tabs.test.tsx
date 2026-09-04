import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs } from './Tabs'

function setup() {
  return render(
    <Tabs
      tabs={[
        { id: 'a', label: 'Results', content: <p>Results content</p> },
        { id: 'b', label: 'Prepayment', content: <p>Prepayment content</p> },
        { id: 'c', label: 'Advanced', content: <p>Advanced content</p> },
      ]}
    />,
  )
}

/** Walks up to the .tab-panel wrapper and checks its `hidden` attribute. */
function isHidden(el: HTMLElement) {
  return el.closest('.tab-panel')?.hasAttribute('hidden') ?? false
}

describe('Tabs', () => {
  it('shows only the first tab by default', () => {
    setup()
    expect(isHidden(screen.getByText('Results content'))).toBe(false)
    expect(isHidden(screen.getByText('Prepayment content'))).toBe(true)
    expect(isHidden(screen.getByText('Advanced content'))).toBe(true)
  })

  it('switches the visible panel on click without unmounting the others', () => {
    setup()
    fireEvent.click(screen.getByRole('tab', { name: 'Advanced' }))
    expect(isHidden(screen.getByText('Advanced content'))).toBe(false)
    // getByText itself throws if the node isn't in the DOM, so reaching this
    // line already proves the other tab's content stayed mounted (not
    // unmounted) — switching tabs must not lose state or re-run calculations.
    expect(isHidden(screen.getByText('Results content'))).toBe(true)
  })

  it('marks the active tab with aria-selected', () => {
    setup()
    fireEvent.click(screen.getByRole('tab', { name: 'Prepayment' }))
    expect(screen.getByRole('tab', { name: 'Prepayment' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'Results' }).getAttribute('aria-selected')).toBe('false')
  })

  it('every tab panel carries the tab-panel class the print override targets', () => {
    const { container } = setup()
    expect(container.querySelectorAll('.tab-panel')).toHaveLength(3)
  })
})
