import * as React from 'react';

/**
 * Recursively clones React children and applies props to matching elements
 * Used by compound components to inject shared props into nested children
 * 
 * @param children - React children to process
 * @param props - Props to inject into matching children
 * @param componentNames - Optional array of displayNames to filter which components receive props
 * @param uniqueId - Optional unique ID for key generation
 * @param asChild - Optional flag for polymorphic rendering
 */
export function recursiveCloneChildren(
  children: React.ReactNode,
  props: Record<string, unknown> = {},
  componentNames?: string[],
  uniqueId?: string,
  asChild?: boolean
): React.ReactNode {
  return React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    // Get the component's displayName for filtering
    const childType = child.type as React.ComponentType & { displayName?: string };
    const displayName = childType?.displayName;

    // Check if this child should receive props
    const shouldApplyProps = componentNames
      ? componentNames.includes(displayName || '')
      : true;

    // Recursively process children - safely access props
    const childProps = child.props as { children?: React.ReactNode };
    const childChildren = childProps.children;
    const processedChildren = childChildren
      ? recursiveCloneChildren(childChildren, props, componentNames, uniqueId, asChild)
      : childChildren;

    // Generate a unique key if needed
    const key = uniqueId ? `${uniqueId}-${index}` : child.key;

    // Clone with new props if filter matches
    if (shouldApplyProps) {
      return React.cloneElement(child, {
        ...props,
        key,
        children: processedChildren,
      } as React.Attributes);
    }

    // Just update children without applying props
    if (processedChildren !== childChildren) {
      return React.cloneElement(child, {
        key,
        children: processedChildren,
      } as React.Attributes);
    }

    return child;
  });
}
