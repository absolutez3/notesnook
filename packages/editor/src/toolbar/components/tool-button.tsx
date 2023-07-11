/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { Theme } from "@notesnook/theme";
import { SchemeColors } from "@notesnook/theme";
import React from "react";
import { ButtonProps } from "@theme-ui/components";
import { IconNames, Icons } from "../icons";
import { ToolButtonVariant } from "../types";
import { Button } from "../../components/button";
import { Icon } from "@notesnook/ui";

export type ToolButtonProps = ButtonProps & {
  icon: IconNames;
  iconColor?: SchemeColors;
  iconSize?: keyof Theme["iconSizes"] | number;
  toggled: boolean;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  variant?: ToolButtonVariant;
};
export const ToolButton = React.memo(
  function ToolButton(props: ToolButtonProps) {
    const {
      id,
      icon,
      iconSize,
      iconColor,
      toggled,
      sx,
      buttonRef,
      variant = "normal",
      ...buttonProps
    } = props;

    return (
      <Button
        ref={buttonRef}
        tabIndex={-1}
        id={`tool-${id || icon}`}
        sx={{
          flexShrink: 0,
          p: variant === "small" ? "small" : 1,
          borderRadius: variant === "small" ? "small" : "default",
          m: 0,
          bg: toggled ? "hover" : "transparent",
          mr: variant === "small" ? 0 : 1,
          ":hover": { bg: "hover" },
          ":last-of-type": {
            mr: 0
          },
          ...sx
        }}
        onMouseDown={(e) => e.preventDefault()}
        {...buttonProps}
      >
        <Icon
          path={Icons[icon]}
          color={iconColor || "icon"}
          size={iconSize || (variant === "small" ? "medium" : "big")}
        />
      </Button>
    );
  },
  (prev, next) => {
    return (
      prev.toggled === next.toggled &&
      prev.icon === next.icon &&
      JSON.stringify(prev.sx) === JSON.stringify(next.sx)
    );
  }
);
