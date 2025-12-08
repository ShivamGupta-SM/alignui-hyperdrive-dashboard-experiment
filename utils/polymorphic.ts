import * as React from 'react';

/**
 * Polymorphic component utilities for creating flexible, type-safe components
 * that can render as different HTML elements or other components
 */

/**
 * Generic type for the "as" prop
 */
export type AsProp<C extends React.ElementType> = {
  as?: C;
};

/**
 * Props to omit from the element when using polymorphic components
 */
export type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

/**
 * Polymorphic component props type
 * Combines component-specific props with the props of the underlying element
 */
export type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = object,
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

/**
 * Polymorphic component props with ref support
 */
export type PolymorphicComponentPropsWithRef<
  C extends React.ElementType,
  Props = object,
> = PolymorphicComponentProps<C, Props> & { ref?: PolymorphicRef<C> };

/**
 * Polymorphic ref type
 */
export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

/**
 * Namespace for polymorphic utilities
 */
export namespace Polymorphic {
  export type OwnProps<P> = P;
  export type Props<C extends React.ElementType, P = object> = PolymorphicComponentProps<C, P>;
  export type PropsWithRef<C extends React.ElementType, P = object> = PolymorphicComponentPropsWithRef<C, P>;
  export type Ref<C extends React.ElementType> = PolymorphicRef<C>;
}

