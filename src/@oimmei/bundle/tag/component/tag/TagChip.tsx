import React, {ReactElement} from "react";
import {Tag} from "@/@oimmei/bundle/tag/type/model/Tag";
import Chip from "@mui/material/Chip";

export default function TagChip({tag}: {tag: Tag}): ReactElement {
  return <Chip
    key={tag.id} sx={{
    marginRight: 1,
    backgroundColor: tag.color,
    color: "white",
    height: 20,
    borderRadius: 10,
  }} label={tag.label}/>;
}