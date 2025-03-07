/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

jest.mock('@react-aria/live-announcer');
import {announce} from '@react-aria/live-announcer';
import {CalendarDate} from '@internationalized/date';
import {fireEvent, render} from '@testing-library/react';
import {RangeCalendar} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

let cellFormatter = new Intl.DateTimeFormat('en-US', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
let keyCodes = {'Enter': 13, ' ': 32, 'PageUp': 33, 'PageDown': 34, 'End': 35, 'Home': 36, 'ArrowLeft': 37, 'ArrowUp': 38, 'ArrowRight': 39, 'ArrowDown': 40, Escape: 27};

function type(key) {
  fireEvent.keyDown(document.activeElement, {key});
  fireEvent.keyUp(document.activeElement, {key});
}

describe('RangeCalendar', () => {
  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });

  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
  });

  describe('basics', () => {
    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}}}
    `('$Name should render a calendar with a defaultValue', ({RangeCalendar, props}) => {
      let {getAllByLabelText, getByRole, getAllByRole} = render(<RangeCalendar {...props} />);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent('June 2019');

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);

      let selectedDates = getAllByLabelText('Selected', {exact: false});
      let labels = [
        'Wednesday, June 5, 2019 selected',
        'Thursday, June 6, 2019 selected',
        'Friday, June 7, 2019 selected',
        'Saturday, June 8, 2019 selected',
        'Sunday, June 9, 2019 selected',
        'Monday, June 10, 2019 selected'
      ];
      expect(selectedDates.length).toBe(6);

      let i = 0;
      for (let cell of selectedDates) {
        expect(cell.parentElement).toHaveAttribute('role', 'gridcell');
        expect(cell.parentElement).toHaveAttribute('aria-selected', 'true');
        expect(cell).toHaveAttribute('aria-label', labels[i++]);
      }
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}}}
    `('$Name should render a calendar with a value', ({RangeCalendar, props}) => {
      let {getAllByLabelText, getByRole, getAllByRole} = render(<RangeCalendar {...props} />);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent('June 2019');

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);

      let selectedDates = getAllByLabelText('Selected', {exact: false});
      let labels = [
        'Wednesday, June 5, 2019 selected',
        'Thursday, June 6, 2019 selected',
        'Friday, June 7, 2019 selected',
        'Saturday, June 8, 2019 selected',
        'Sunday, June 9, 2019 selected',
        'Monday, June 10, 2019 selected'
      ];
      expect(selectedDates.length).toBe(6);

      let i = 0;
      for (let cell of selectedDates) {
        expect(cell.parentElement).toHaveAttribute('role', 'gridcell');
        expect(cell.parentElement).toHaveAttribute('aria-selected', 'true');
        expect(cell).toHaveAttribute('aria-label', labels[i++]);
      }
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{value: {start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 2, 18)}}}
    `('$Name should focus the first selected date if autoFocus is set', ({RangeCalendar, props}) => {
      let {getByRole, getAllByLabelText} = render(<RangeCalendar {...props} autoFocus />);

      let cells = getAllByLabelText('selected', {exact: false});
      let grid = getByRole('grid');

      expect(cells[0].parentElement).toHaveAttribute('role', 'gridcell');
      expect(cells[0].parentElement).toHaveAttribute('aria-selected', 'true');
      expect(cells[0]).toHaveFocus();
      expect(grid).not.toHaveAttribute('aria-activedescendant');
    });

    // v2 doesn't pass this test - it starts by showing the end date instead of the start date.
    it('should show selected dates across multiple months', () => {
      let {getByRole, getByLabelText, getAllByLabelText, getAllByRole} = render(<RangeCalendar value={{start: new CalendarDate(2019, 6, 20), end: new CalendarDate(2019, 7, 10)}} />);

      let heading = getByRole('heading');
      expect(heading).toHaveTextContent('June 2019');

      let gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);

      let selected = getAllByLabelText('selected', {exact: false}).filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(selected.length).toBe(11);
      let juneLabels = [
        'Thursday, June 20, 2019 selected',
        'Friday, June 21, 2019 selected',
        'Saturday, June 22, 2019 selected',
        'Sunday, June 23, 2019 selected',
        'Monday, June 24, 2019 selected',
        'Tuesday, June 25, 2019 selected',
        'Wednesday, June 26, 2019 selected',
        'Thursday, June 27, 2019 selected',
        'Friday, June 28, 2019 selected',
        'Saturday, June 29, 2019 selected',
        'Sunday, June 30, 2019 selected'
      ];

      let i = 0;
      for (let cell of selected) {
        expect(cell.parentElement).toHaveAttribute('aria-selected', 'true');
        expect(cell).toHaveAttribute('aria-label', juneLabels[i++]);
      }

      let nextButton = getByLabelText('Next');
      userEvent.click(nextButton);

      selected = getAllByLabelText('selected', {exact: false}).filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(selected.length).toBe(10);
      let julyLabels = [
        'Monday, July 1, 2019 selected',
        'Tuesday, July 2, 2019 selected',
        'Wednesday, July 3, 2019 selected',
        'Thursday, July 4, 2019 selected',
        'Friday, July 5, 2019 selected',
        'Saturday, July 6, 2019 selected',
        'Sunday, July 7, 2019 selected',
        'Monday, July 8, 2019 selected',
        'Tuesday, July 9, 2019 selected',
        'Wednesday, July 10, 2019 selected'
      ];

      i = 0;
      for (let cell of selected) {
        expect(cell.parentElement).toHaveAttribute('aria-selected', 'true');
        expect(cell).toHaveAttribute('aria-label', julyLabels[i++]);
      }

      expect(heading).toHaveTextContent('July 2019');
      gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(31);

      expect(nextButton).toHaveFocus();

      let prevButton = getByLabelText('Previous');
      userEvent.click(prevButton);

      expect(heading).toHaveTextContent('June 2019');
      gridCells = getAllByRole('gridcell').filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(gridCells.length).toBe(30);

      selected = getAllByLabelText('selected', {exact: false}).filter(cell => cell.getAttribute('aria-disabled') !== 'true');
      expect(selected.length).toBe(11);
      i = 0;
      for (let cell of selected) {
        expect(cell.parentElement).toHaveAttribute('aria-selected', 'true');
        expect(cell).toHaveAttribute('aria-label', juneLabels[i++]);
      }

      expect(prevButton).toHaveFocus();
    });

    it('should center the selected range if multiple months are visible', () => {
      let {getAllByRole, getAllByLabelText} = render(<RangeCalendar value={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 2, 10)}} visibleMonths={3} />);

      let grids = getAllByRole('grid');
      expect(grids).toHaveLength(3);

      let cells = getAllByLabelText('selected', {exact: false});
      expect(cells.every(cell => grids[1].contains(cell))).toBe(true);
    });

    it('should constrain the visible region depending on the minValue', () => {
      let {getAllByRole, getAllByLabelText} = render(<RangeCalendar value={{start: new CalendarDate(2019, 2, 3), end: new CalendarDate(2019, 2, 10)}} minValue={new CalendarDate(2019, 2, 1)} visibleMonths={3} />);

      let grids = getAllByRole('grid');
      expect(grids).toHaveLength(3);

      let cells = getAllByLabelText('selected', {exact: false});
      expect(cells.every(cell => grids[0].contains(cell))).toBe(true);
    });

    it('should start align the selected range if it would go out of view when centered', () => {
      let {getAllByRole, getAllByLabelText} = render(<RangeCalendar value={{start: new CalendarDate(2019, 1, 3), end: new CalendarDate(2019, 3, 10)}} visibleMonths={3} />);

      let grids = getAllByRole('grid');
      expect(grids).toHaveLength(3);

      let cells = getAllByLabelText('selected', {exact: false});
      expect(grids[0].contains(cells[0])).toBe(true);
    });
  });

  describe('selection', () => {
    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{}}
    `('$Name adds a range selection prompt to the focused cell', ({RangeCalendar, props}) => {
      let {getByRole, getByLabelText} = render(<RangeCalendar {...props} autoFocus />);

      let grid = getByRole('grid');
      let cell = getByLabelText('today', {exact: false});
      expect(grid).not.toHaveAttribute('aria-activedescendant');
      expect(cell).toHaveAttribute('aria-label', `Today, ${cellFormatter.format(new Date())} (Click to start selecting date range)`);

      // enter selection mode
      fireEvent.keyDown(grid, {key: 'Enter', keyCode: keyCodes.Enter});
      expect(grid).not.toHaveAttribute('aria-activedescendant');
      expect(cell.parentElement).toHaveAttribute('aria-selected');
      expect(cell).toHaveAttribute('aria-label', `Today, ${cellFormatter.format(new Date())} selected (Click to finish selecting date range)`);
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}}}
    `('$Name can select a range with the keyboard (uncontrolled)', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <RangeCalendar
          {...props}
          autoFocus
          onChange={onChange} />
      );

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');

      // Select a new date
      type('ArrowLeft');

      // Begin selecting
      type('Enter');

      // Auto advances by one day
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('4');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('5');
      expect(onChange).toHaveBeenCalledTimes(0);

      // Move focus
      type('ArrowRight');
      type('ArrowRight');
      type('ArrowRight');
      type('ArrowRight');

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('4');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('9');
      expect(onChange).toHaveBeenCalledTimes(0);

      // End selection
      type(' ');
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('4'); // uncontrolled
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('9');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 4));
      expect(end).toEqual(new CalendarDate(2019, 6, 9));
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}}}
    `('$Name can select a range with the keyboard (controlled)', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getAllByLabelText} = render(
        <RangeCalendar
          {...props}
          autoFocus
          onChange={onChange} />
      );

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');

      // Select a new date
      type('ArrowLeft');

      // Begin selecting
      type('Enter');

      // Auto advances by one day
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('4');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('5');
      expect(onChange).toHaveBeenCalledTimes(0);

      // Move focus
      type('ArrowRight');
      type('ArrowRight');
      type('ArrowRight');
      type('ArrowRight');

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('4');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('9');
      expect(onChange).toHaveBeenCalledTimes(0);

      // End selection
      type(' ');
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5'); // controlled
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 4));
      expect(end).toEqual(new CalendarDate(2019, 6, 9));
    });

    it('does not enter selection mode with the keyboard if isReadOnly', () => {
      let {getByRole, getByLabelText} = render(<RangeCalendar isReadOnly autoFocus />);

      let grid = getByRole('grid');
      let cell = getByLabelText('today', {exact: false});
      expect(grid).not.toHaveAttribute('aria-activedescendant');
      expect(cell).toHaveAttribute('aria-label', `Today, ${cellFormatter.format(new Date())}`);
      expect(document.activeElement).toBe(cell);

      // try to enter selection mode
      fireEvent.keyDown(grid, {key: 'Enter', keyCode: keyCodes.Enter});
      expect(grid).not.toHaveAttribute('aria-activedescendant');
      expect(cell.parentElement).not.toHaveAttribute('aria-selected');
      expect(cell).toHaveAttribute('aria-label', `Today, ${cellFormatter.format(new Date())}`);
      expect(document.activeElement).toBe(cell);
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}}}
    `('$Name selects a range with the mouse (uncontrolled)', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(
        <RangeCalendar
          {...props}
          onChange={onChange} />
      );

      userEvent.click(getByText('17'));

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('17');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(0);

      // hovering updates the highlighted dates
      fireEvent.pointerEnter(getByText('10'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.pointerEnter(getByText('7'));
      userEvent.click(getByText('7'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('7'); // uncontrolled
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 7));
      expect(end).toEqual(new CalendarDate(2019, 6, 17));
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}}}
    `('$Name selects a range with the mouse (controlled)', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(
        <RangeCalendar
          {...props}
          onChange={onChange} />
      );

      userEvent.click(getByText('17'));

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('17');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(0);

      // hovering updates the highlighted dates
      fireEvent.pointerEnter(getByText('10'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.pointerEnter(getByText('7'));
      userEvent.click(getByText('7'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5'); // controlled
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 7));
      expect(end).toEqual(new CalendarDate(2019, 6, 17));
    });

    it('selects by dragging with the mouse', () => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(<RangeCalendar onChange={onChange} defaultValue={{start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}} />);

      fireEvent.mouseDown(getByText('17'), {detail: 1});

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('17');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(0);

      // dragging updates the highlighted dates
      fireEvent.pointerEnter(getByText('18'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('17');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('18');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.pointerEnter(getByText('23'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('17');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('23');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.mouseUp(getByText('23'), {detail: 1});

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('17');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('23');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 17));
      expect(end).toEqual(new CalendarDate(2019, 6, 23));
    });

    it('allows dragging the start of the highlighted range to modify it', () => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(<RangeCalendar onChange={onChange} defaultValue={{start: new CalendarDate(2019, 6, 10), end: new CalendarDate(2019, 6, 20)}} />);

      fireEvent.mouseDown(getByText('10'), {detail: 1});

      // mouse down on a range end should not reset it
      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('20');
      expect(onChange).toHaveBeenCalledTimes(0);

      // dragging updates the highlighted dates
      fireEvent.pointerEnter(getByText('11'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('11');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('20');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.pointerEnter(getByText('8'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('8');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('20');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.mouseUp(getByText('8'), {detail: 1});

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('8');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('20');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 8));
      expect(end).toEqual(new CalendarDate(2019, 6, 20));
    });

    it('allows dragging the end of the highlighted range to modify it', () => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(<RangeCalendar onChange={onChange} defaultValue={{start: new CalendarDate(2019, 6, 10), end: new CalendarDate(2019, 6, 20)}} />);

      fireEvent.mouseDown(getByText('20'), {detail: 1});

      // mouse down on a range end should not reset it
      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('20');
      expect(onChange).toHaveBeenCalledTimes(0);

      // dragging updates the highlighted dates
      fireEvent.pointerEnter(getByText('21'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('21');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.pointerEnter(getByText('19'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('19');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.mouseUp(getByText('19'), {detail: 1});

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('19');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 10));
      expect(end).toEqual(new CalendarDate(2019, 6, 19));
    });

    it('releasing drag outside calendar commits it', () => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(<RangeCalendar onChange={onChange} defaultValue={{start: new CalendarDate(2019, 6, 10), end: new CalendarDate(2019, 6, 20)}} />);

      fireEvent.mouseDown(getByText('22'), {detail: 1});

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('22');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('22');
      expect(onChange).toHaveBeenCalledTimes(0);

      // dragging updates the highlighted dates
      fireEvent.pointerEnter(getByText('25'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('22');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('25');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.pointerUp(document.body);

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('22');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('25');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 22));
      expect(end).toEqual(new CalendarDate(2019, 6, 25));
    });

    it('clicking outside calendar commits selection', () => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(<RangeCalendar onChange={onChange} defaultValue={{start: new CalendarDate(2019, 6, 10), end: new CalendarDate(2019, 6, 20)}} />);

      userEvent.click(getByText('22'));

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('22');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('22');
      expect(onChange).toHaveBeenCalledTimes(0);

      // hovering updates the highlighted dates
      fireEvent.pointerEnter(getByText('25'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('22');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('25');
      expect(onChange).toHaveBeenCalledTimes(0);

      userEvent.click(document.body);

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('22');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('25');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 22));
      expect(end).toEqual(new CalendarDate(2019, 6, 25));
    });

    it('clicking on next/previous buttons does not commit selection', () => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByLabelText, getByText} = render(<RangeCalendar onChange={onChange} defaultValue={{start: new CalendarDate(2019, 6, 10), end: new CalendarDate(2019, 6, 20)}} />);

      userEvent.click(getByText('22'));

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('22');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('22');
      expect(onChange).toHaveBeenCalledTimes(0);

      // hovering updates the highlighted dates
      fireEvent.pointerEnter(getByText('25'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('22');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('25');
      expect(onChange).toHaveBeenCalledTimes(0);

      let next = getByLabelText('Next');
      userEvent.click(next);

      selectedDates = getAllByLabelText('selected', {exact: false}).filter(d => !d.hasAttribute('aria-disabled'));
      expect(selectedDates[0].textContent).toBe('1');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('25');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.pointerEnter(getByText('10'));
      selectedDates = getAllByLabelText('selected', {exact: false}).filter(d => !d.hasAttribute('aria-disabled'));
      expect(selectedDates[0].textContent).toBe('1');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');
      expect(onChange).toHaveBeenCalledTimes(0);

      userEvent.click(getByText('10'));
      selectedDates = getAllByLabelText('selected', {exact: false}).filter(d => !d.hasAttribute('aria-disabled'));
      expect(selectedDates[0].textContent).toBe('1');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 22));
      expect(end).toEqual(new CalendarDate(2019, 7, 10));
    });

    it('clicking on the start of the highlighted range starts a new selection', () => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(<RangeCalendar onChange={onChange} defaultValue={{start: new CalendarDate(2019, 6, 10), end: new CalendarDate(2019, 6, 20)}} />);

      fireEvent.mouseDown(getByText('10'), {detail: 1});

      // mouse down on a range end should not reset it
      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('20');
      expect(onChange).toHaveBeenCalledTimes(0);

      // mouse up should
      fireEvent.mouseUp(getByText('10'), {detail: 1});
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');
      expect(onChange).toHaveBeenCalledTimes(0);

      // hovering updates the highlighted dates
      fireEvent.pointerEnter(getByText('11'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('11');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.pointerEnter(getByText('12'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('12');
      expect(onChange).toHaveBeenCalledTimes(0);

      userEvent.click(getByText('12'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('12');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 10));
      expect(end).toEqual(new CalendarDate(2019, 6, 12));
    });

    it('clicking on the end of the highlighted range starts a new selection', () => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(<RangeCalendar onChange={onChange} defaultValue={{start: new CalendarDate(2019, 6, 10), end: new CalendarDate(2019, 6, 20)}} />);

      fireEvent.mouseDown(getByText('20'), {detail: 1});

      // mouse down on a range end should not reset it
      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('20');
      expect(onChange).toHaveBeenCalledTimes(0);

      // mouse up should
      fireEvent.mouseUp(getByText('20'), {detail: 1});
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('20');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('20');
      expect(onChange).toHaveBeenCalledTimes(0);

      // hovering updates the highlighted dates
      fireEvent.pointerEnter(getByText('19'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('19');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('20');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.pointerEnter(getByText('18'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('18');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('20');
      expect(onChange).toHaveBeenCalledTimes(0);

      userEvent.click(getByText('18'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('18');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('20');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 18));
      expect(end).toEqual(new CalendarDate(2019, 6, 20));
    });

    it('mouse down in the middle of the highlighted range starts a new selection', () => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(<RangeCalendar onChange={onChange} defaultValue={{start: new CalendarDate(2019, 6, 10), end: new CalendarDate(2019, 6, 20)}} />);

      fireEvent.mouseDown(getByText('15'), {detail: 1});

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('15');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('15');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.mouseUp(getByText('15'), {detail: 1});

      // hovering updates the highlighted dates
      fireEvent.pointerEnter(getByText('16'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('15');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('16');
      expect(onChange).toHaveBeenCalledTimes(0);

      fireEvent.pointerEnter(getByText('17'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('15');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(0);

      userEvent.click(getByText('17'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('15');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).toHaveBeenCalledTimes(1);

      let {start, end} = onChange.mock.calls[0][0];
      expect(start).toEqual(new CalendarDate(2019, 6, 15));
      expect(end).toEqual(new CalendarDate(2019, 6, 17));
    });

    it('does not enter selection mode with the mouse if isReadOnly', () => {
      let {getByRole, getByLabelText, getByText} = render(<RangeCalendar isReadOnly autoFocus />);

      let grid = getByRole('grid');
      let cell = getByLabelText('today', {exact: false});
      expect(grid).not.toHaveAttribute('aria-activedescendant');
      expect(document.activeElement).toBe(cell);

      // try to enter selection mode
      cell = getByText('17');
      userEvent.click(cell);
      expect(grid).not.toHaveAttribute('aria-activedescendant');
      expect(cell.parentElement).not.toHaveAttribute('aria-selected');
      expect(document.activeElement).toBe(cell);
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{isDisabled: true}}
    `('$Name does not select a date on click if isDisabled', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getAllByLabelText, getByText} = render(
        <RangeCalendar
          {...props}
          onChange={onChange} />
      );

      let newDate = getByText('17');
      userEvent.click(newDate);

      expect(() => {
        getAllByLabelText('selected', {exact: false});
      }).toThrow();
      expect(onChange).not.toHaveBeenCalled();
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{defaultValue: {start: new CalendarDate(2019, 2, 8), end: new CalendarDate(2019, 2, 15)}, minValue: new CalendarDate(2019, 2, 5), maxValue: new CalendarDate(2019, 2, 15)}}
    `('$Name does not select a date on click if outside the valid date range', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getByLabelText, getAllByLabelText} = render(
        <RangeCalendar
          onChange={onChange}
          {...props} />
      );

      userEvent.click(getByLabelText('Sunday, February 3, 2019'));

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('8');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('15');
      expect(onChange).not.toHaveBeenCalled();

      userEvent.click(getByLabelText('Sunday, February 17, 2019'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('8');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('15');
      expect(onChange).not.toHaveBeenCalled();

      userEvent.click(getByLabelText('Tuesday, February 5, 2019'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('5');
      expect(onChange).not.toHaveBeenCalled();

      userEvent.click(getByLabelText('Friday, February 15, 2019'));

      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('15');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it.each`
      Name          | RangeCalendar    | props
      ${'v3'}       | ${RangeCalendar} | ${{value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}}}
    `('$Name cancels the selection when the escape key is pressed', ({RangeCalendar, props}) => {
      let onChange = jest.fn();
      let {getByText, getAllByLabelText} = render(
        <RangeCalendar
          autoFocus
          onChange={onChange}
          {...props} />
      );

      // start a selection
      userEvent.click(getByText('17'));

      let selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('17');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).not.toHaveBeenCalled();

      // highlight some dates
      fireEvent.pointerEnter(getByText('10'));
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('10');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('17');
      expect(onChange).not.toHaveBeenCalled();

      // Cancel
      type('Escape');

      // Should revert selection
      selectedDates = getAllByLabelText('selected', {exact: false});
      expect(selectedDates[0].textContent).toBe('5');
      expect(selectedDates[selectedDates.length - 1].textContent).toBe('10');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // These tests only work against v3
  describe('announcing', () => {
    it('announces when the current month changes', () => {
      let {getByLabelText} = render(<RangeCalendar defaultValue={{start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}} />);

      let nextButton = getByLabelText('Next');
      userEvent.click(nextButton);

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith('July 2019');
    });

    it('announces when the selected date range changes', () => {
      let {getByText} = render(<RangeCalendar defaultValue={{start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}} />);

      userEvent.click(getByText('17'));
      userEvent.click(getByText('10'));

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith('Selected Range: June 10, 2019 to June 17, 2019', 'polite', 4000);
    });

    it('ensures that the active descendant is announced when the focused date changes', () => {
      let {getAllByLabelText} = render(<RangeCalendar defaultValue={{start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}} autoFocus />);

      let selectedDates = getAllByLabelText('selected', {exact: false});

      expect(selectedDates[0]).toHaveFocus();
      type('ArrowRight');

      expect(selectedDates[1]).toHaveFocus();
    });

    it('renders a description with the selected date range', () => {
      let {getByText, getByRole} = render(<RangeCalendar defaultValue={{start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}} />);

      let grid = getByRole('grid');
      let caption = document.getElementById(grid.getAttribute('aria-describedby'));
      expect(caption).toHaveTextContent('Selected Range: June 5, 2019 to June 10, 2019');

      userEvent.click(getByText('17'));

      // in selection mode, the caption should be empty
      expect(grid).not.toHaveAttribute('aria-describedby');

      userEvent.click(getByText('10'));

      caption = document.getElementById(grid.getAttribute('aria-describedby'));
      expect(grid).toHaveAttribute('aria-describedby', caption.id);
      expect(caption).toHaveTextContent('Selected Range: June 10, 2019 to June 17, 2019');
    });
  });
});
