import * as Icon from "../icons";
import React, { useMemo, useState } from "react";
import { Button, Flex, Text } from "rebass";
import { AnimatedFlex } from "../animated";
import { db } from "../../common/db";
import { useOpenContextMenu } from "../../utils/useContextMenu";
import { useStore as useNoteStore } from "../../stores/note-store";
import { useStore as useNotebookStore } from "../../stores/notebook-store";
import useMobile from "../../utils/use-mobile";

const groupByToTitleMap = {
  [undefined]: "Default",
  default: "Default",
  abc: "A - Z",
  year: "Year",
  week: "Week",
  month: "Month",
};

const menuItems = [
  {
    key: "sortDirection:asc",
    title: () => "Order by ascending",
  },
  { key: "sortDirection:desc", title: () => "Order by descending" },
  { key: "orderSeperator", type: "seperator" },
  {
    key: "sortBy:dateCreated",
    title: () => "Sort by date created",
    show: (type) => type !== "trash",
  },
  {
    key: "sortBy:dateEdited",
    title: () => "Sort by date edited",
    show: (type) => type !== "trash" && type !== "tags",
  },
  {
    key: "sortBy:dateDeleted",
    title: () => "Sort by date deleted",
    show: (type) => type === "trash",
  },
  {
    key: "sortBy:dateModified",
    title: () => "Sort by date modified",
    show: (type) => type === "tags",
  },
  {
    key: "sortBy:title",
    title: () => "Sort by title",
  },
  { key: "sortSeperator", type: "seperator" },
  { key: "groupBy:default", title: () => "Group by default" },
  { key: "groupBy:year", title: () => "Group by year" },
  { key: "groupBy:month", title: () => "Group by month" },
  { key: "groupBy:week", title: () => "Group by week" },
  { key: "groupBy:abc", title: () => "Group by A - Z" },
];

function changeGroupOptions({ groupOptions, type, refresh }, { key: itemKey }) {
  let [key, value] = itemKey.split(":");
  groupOptions[key] = value;
  if (key === "groupBy") {
    if (value === "abc") groupOptions.sortBy = "title";
    else groupOptions.sortBy = "dateEdited";
  }
  db.settings.setGroupOptions(type, groupOptions);
  refresh();
}

const getMenuItems = (groupOptions, type) => {
  return menuItems.reduce((items, item) => {
    switch (item.type) {
      case "seperator":
        items.push(item);
        break;
      default: {
        let [key, value] = item.key.split(":");

        item.checked = groupOptions[key] === value;

        if (key === "sortBy") {
          if (value === "title")
            item.disabled = () => groupOptions.groupBy !== "abc";
          else item.disabled = () => groupOptions.groupBy === "abc";
        }

        item.onClick = changeGroupOptions;
        if (!item.show || item.show(type)) items.push(item);
        break;
      }
    }

    return items;
  }, []);
};

function GroupHeader(props) {
  const { title, groups, onJump, index, type, refresh } = props;
  const [groupOptions, setGroupOptions] = useState(
    db.settings.getGroupOptions(type)
  );
  const openContextMenu = useOpenContextMenu();
  const notesViewMode = useNoteStore((store) => store.viewMode);
  const setNotesViewMode = useNoteStore((store) => store.setViewMode);
  const notebooksViewMode = useNotebookStore((store) => store.viewMode);
  const setNotebooksViewMode = useNotebookStore((store) => store.setViewMode);

  const [viewMode, setViewMode] = useMemo(() => {
    if (type === "home" || type === "notes" || type === "favorites") {
      return [notesViewMode, setNotesViewMode];
    } else if (type === "notebooks")
      return [notebooksViewMode, setNotebooksViewMode];
    else return [null, null];
  }, [
    type,
    notesViewMode,
    notebooksViewMode,
    setNotesViewMode,
    setNotebooksViewMode,
  ]);
  const isCompact = useMemo(() => viewMode === "compact", [viewMode]);

  if (!title) return null;

  return (
    <AnimatedFlex
      transition={{ duration: 0.3, repeatType: "reverse", repeat: 3 }}
      onClick={(e) => {
        if (groups.length <= 0) return;
        e.stopPropagation();
        const items = groups.map((group) => ({
          key: group.title,
          title: () => group.title,
          onClick: () => onJump(group.title),
          checked: group.title === title,
        }));
        openContextMenu(e, items, {
          title: "Jump to group",
        });
      }}
      p={1}
      mx={1}
      my={1}
      py={1}
      pl={1}
      pr={0}
      alignItems="center"
      justifyContent="space-between"
      bg="bgSecondary"
      sx={{
        borderRadius: "default",
      }}
    >
      <Text
        variant="subtitle"
        fontSize={isCompact ? "body" : "subtitle"}
        color={title === "Conflicted" ? "error" : "primary"}
      >
        {title}
      </Text>

      {index === 0 && (
        <Flex mr={1}>
          <IconButton
            icon={
              groupOptions.sortDirection === "asc"
                ? Icon.SortAsc
                : Icon.SortDesc
            }
            title={`Grouped by ${groupByToTitleMap[groupOptions.groupBy]}`}
            onClick={(e) => {
              const groupOptions = db.settings.getGroupOptions(type);
              setGroupOptions(groupOptions);

              const items = getMenuItems(groupOptions, type);
              openContextMenu(e, items, {
                title: "Group & sort",
                groupOptions,
                refresh,
                type,
              });
            }}
          />
          {viewMode && (
            <IconButton
              icon={
                viewMode === "compact" ? Icon.DetailedView : Icon.CompactView
              }
              title={
                viewMode === "compact"
                  ? "Switch to detailed view"
                  : "Switch to compact view"
              }
              onClick={(e) =>
                setViewMode(viewMode === "compact" ? "detailed" : "compact")
              }
            />
          )}
        </Flex>
      )}
    </AnimatedFlex>
  );
}
export default GroupHeader;

function IconButton(props) {
  const { text, title, onClick } = props;
  const isMobile = useMobile();
  return (
    <Button
      variant="secondary"
      bg="transparent"
      display="flex"
      alignItems="center"
      title={title}
      p={"2px"}
      mr={[2, 0]}
      sx={{ ":last-of-type": { mr: 0 } }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      {text && <Text variant="body">{text}</Text>}
      {props.icon && (
        <props.icon size={isMobile ? 20 : 14} sx={{ ml: text ? 1 : 0 }} />
      )}
    </Button>
  );
}