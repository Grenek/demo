import React, {
  useState, useMemo, useCallback, useRef, ReactElement,
} from 'react';
import { useTranslation } from 'react-i18next';
import { values } from 'lodash';
import { useField } from 'formik';
import classnames from 'classnames';
import { IFormValue } from '../../validator/useValidator';
import { DropdownIndicator } from './components/DropdownIndicator/DropdownIndicator';
import { ClearIndicator } from './components/ClearIndicator/ClearIndicator';
import { List } from './components/List/List';
import { Input } from './components/Input/Input';
import { ICreatableSelectFieldOption, IOption } from './ICreatableSelectFieldOption';
import * as style from './CreatableSelectField.css';
import { COUNT_OF_LIST_ITEMS } from './constants';

interface ICreatableSelectFieldProps<Option> {
  name: string;
  label: string;
  minSearchLength: number;
  inputClassName?: string;
  placeholder?: string;
  options: Array<Option> | null;
  errorDataQaLocator?: string;
  onChange?(option: string): void;
  renderItem(option: Option, inputValue: Option, isActive: boolean): ReactElement;
  renderValue(option: Option): string;
  validate?: (currentValue: IFormValue) => Promise<string>;
}

export const CreatableSelectField = <Option, >({
  label,
  options,
  inputClassName,
  errorDataQaLocator,
  minSearchLength,
  placeholder = '',
  onChange,
  renderItem,
  renderValue,
  ...props
}: ICreatableSelectFieldProps<Option>) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [field, meta, helper] = useField(props);
  const { value } = field;
  const [activeItem, activeItemChange] = useState<number>(0);
  const [listItemHeight, listItemHeightChange] = useState<number>(0);
  const [isOpen, isOpenChange] = useState<boolean>(false);

  const filterOptions = (
    options: Option[],
  ): ICreatableSelectFieldOption<Option>[] => options.map((option) => ({
    key: values(option as IOption).join('-'),
    option,
  }));

  const filtredOptions: ICreatableSelectFieldOption<Option>[] = useMemo(
    () => (options ? filterOptions(options) : []),
    [options, value],
  );

  const setTouch = useCallback((isTouch: boolean) => {
    helper.setTouched(isTouch);
  }, [helper.setTouched]);

  const valueChange = useCallback((currentValue: string) => {
    helper.setValue({
      name: currentValue,
    });

    if (onChange) {
      onChange(currentValue);
    }
  }, [helper.setValue]);

  const selectItem = useCallback((selectedValue: Option) => {
    helper.setValue(selectedValue);
    isOpenChange(false);
  }, [valueChange, isOpenChange]);

  const hoverItem = useCallback((hoveredActiveItem: number) => {
    activeItemChange(hoveredActiveItem);
  }, [activeItemChange]);

  const isValidationError = useMemo(
    () => Boolean(meta.error && meta.touched), [meta.error, meta.touched],
  );

  const errorClassNames = classnames(
    isValidationError ? style.errorMessage : style.errorMessageDefault,
  );

  const onFocusHandler = useCallback(() => {
    if (value.name.length > 2) {
      isOpenChange(true);
    }
    helper.setTouched(false);
  }, [value]);

  const onBlurHandler = useCallback(() => {
    helper.setValue({
      ...value,
      name: value.name.trim(),
    });
  }, [value]);

  const countOfListItems = filtredOptions.length < COUNT_OF_LIST_ITEMS
    ? filtredOptions.length : COUNT_OF_LIST_ITEMS;

  return (
    <div className={style.creatableSelectField}>
      <label className={style.label}>{label}</label>
      <div className={style.inputContainer}>
        <Input<Option>
          className={inputClassName}
          valueChange={valueChange}
          selectItem={selectItem}
          activeItemChange={activeItemChange}
          isOpenChange={isOpenChange}
          setTouch={setTouch}
          onFocusHandler={onFocusHandler}
          onBlurHandler={onBlurHandler}
          filtredOptions={filtredOptions}
          activeItem={activeItem}
          value={renderValue(value)}
          placeholder={placeholder}
          isValidationError={isValidationError}
          inputRef={inputRef}
          listRef={listRef}
          listItemHeight={listItemHeight}
          countOfListItems={countOfListItems}
        />
        <ClearIndicator
          valueChange={valueChange}
          disabled={!renderValue(value)}
          inputRef={inputRef}
        />
        <DropdownIndicator
          isOpenChange={isOpenChange}
          setTouch={setTouch}
          isOpen={Boolean(filtredOptions?.length && isOpen)}
          disabled={Boolean(!filtredOptions?.length) || value?.name?.length < minSearchLength}
          inputRef={inputRef}
        />
      </div>
      {isOpen && Boolean(filtredOptions.length) && (
        <List<Option>
          selectItem={selectItem}
          hoverItem={hoverItem}
          renderItem={renderItem}
          listItemHeightChange={listItemHeightChange}
          listItemHeight={listItemHeight}
          listRef={listRef}
          activeItem={activeItem}
          options={filtredOptions}
          value={value}
          countOfListItems={countOfListItems}
        />
      )}
      <div data-qa-locator={errorDataQaLocator} className={errorClassNames}>
        {t(meta.error as string)}
      </div>
    </div>
  );
};

CreatableSelectField.displayName = 'CreatableSelectField';