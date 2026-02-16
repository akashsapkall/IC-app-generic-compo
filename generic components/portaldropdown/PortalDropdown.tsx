import React, { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalDropdownProps {
    isOpen: boolean;
    triggerRef: React.RefObject<HTMLElement>;
    children: ReactNode;
    onClose: () => void;
    minWidth?: number;
    maxHeight?: number;
    className?: string;
    placement?: 'bottom' | 'top' | 'auto';
    offset?: number;
}

export interface DropdownPosition {
    top: number;
    left: number;
    width: number;
}

const PortalDropdown: React.FC<PortalDropdownProps> = ({
    isOpen,
    triggerRef,
    children,
    onClose,
    minWidth = 250,
    maxHeight = 300,
    className = '',
    placement = 'auto',
    offset = 4
}) => {
    const [position, setPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Calculate position - Always position at bottom of trigger
            let top = rect.bottom + window.scrollY + offset;
            let left = rect.left + window.scrollX;

            // Only apply placement logic if specified, otherwise default to bottom
            if (placement === 'top') {
                top = rect.top + window.scrollY - maxHeight - offset;
            } else if (placement === 'auto') {
                // Check if there's enough space below
                if (rect.bottom + maxHeight + offset > viewportHeight) {
                    // Show above if not enough space below
                    top = rect.top + window.scrollY - maxHeight - offset;
                }
            }
            // For 'bottom' or default, keep the bottom positioning

            // Adjust horizontal position if going off screen
            if (left + minWidth > viewportWidth) {
                left = viewportWidth - minWidth - 10;
            }

            // Ensure dropdown doesn't go off left edge
            if (left < 10) {
                left = 10;
            }

            setPosition({
                top,
                left,
                width: Math.max(rect.width, minWidth)
            });
        }
    }, [isOpen, minWidth, maxHeight, placement, offset]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Don't close if clicking on the trigger
            if (triggerRef.current && triggerRef.current.contains(target)) {
                return;
            }

            // Don't close if clicking inside the dropdown
            const dropdownElement = document.getElementById('portal-dropdown-content');
            if (dropdownElement && dropdownElement.contains(target)) {
                return;
            }

            // Close dropdown for outside clicks
            onClose();
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleScroll = (event: Event) => {
            const target = event.target as Element;

            // Don't close if scrolling inside the dropdown
            const dropdownElement = document.getElementById('portal-dropdown-content');
            if (dropdownElement && (dropdownElement.contains(target) || dropdownElement === target)) {
                return;
            }

            // Don't close if scrolling inside the trigger element
            if (triggerRef.current && (triggerRef.current.contains(target) || triggerRef.current === target)) {
                return;
            }

            // Close dropdown only for external scroll events
            onClose();
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            // Use capture phase to catch scroll events early
            document.addEventListener('scroll', handleScroll, true);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleEscape);
                document.removeEventListener('scroll', handleScroll, true);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            id="portal-dropdown-content"
            data-portal-dropdown="true"
            className={`fixed bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden ${className}`}
            style={{
                top: position.top,
                left: position.left,
                minWidth: position.width,
                maxHeight: maxHeight,
                zIndex: 10000
            }}
            // Prevent click event bubbling from dropdown content
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {children}
        </div>,
        document.body
    );
};

export default PortalDropdown;