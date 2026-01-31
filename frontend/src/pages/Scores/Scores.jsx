import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { yupResolver } from "@hookform/resolvers/yup";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SearchIcon from "@mui/icons-material/Search";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import visuallyHidden from "@mui/utils/visuallyHidden";
import PropTypes from "prop-types";

import Loading from "../../components/Loading/Loading";
import Modal from "../../components/Modal/Modal";
import { useNotify } from "../../hooks/useNotify";
import { useCreateRoomMutation } from "../../redux/apis/rooms/createRoom";
import { useGetAllRoomsQuery } from "../../redux/apis/rooms/getAllRooms";
import { useConvertScoreMutation } from "../../redux/apis/scores/convert";
import { useDeleteScoreMutation } from "../../redux/apis/scores/deleteScores";
import { useGetAllScoresQuery } from "../../redux/apis/scores/getAllScores";
import { useLazyUploadScoreQuery } from "../../redux/apis/scores/uploadScore";
import { schema } from "./helpers";

const createData = (id, scoreName, fullName, dateCreated) => {
  return {
    id,
    scoreName,
    fullName,
    dateCreated,
  };
};

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const headCells = [
  {
    id: "scoreName",
    numeric: false,
    disablePadding: true,
    label: "Score Name",
  },
  {
    id: "fullName",
    numeric: false,
    disablePadding: true,
    label: "Uploaded By",
  },
  {
    id: "dateCreated",
    numeric: false,
    disablePadding: false,
    label: "Date Uploaded",
  },
];

const EnhancedTableHead = (props) => {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headCells.map((headCell, index) => (
          <TableCell
            key={headCell.id}
            align={index === 0 ? "left" : "center"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
              sx={{ mr: "-22px" }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const EnhancedTableToolbar = ({
  selected,
  onOpenModal,
  searchQuery,
  setSearchQuery,
  handleUploadScore,
  handleDeleteScores,
}) => {
  const notify = useNotify();
  const numSelected = selected.length;
  const [searchBar, setSearchBar] = useState(searchQuery);

  const handleSearch = () => {
    setSearchQuery(searchBar);
    // setSearchBar("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { sm: 2 },
        },
      ]}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextField
          size="small"
          autoComplete="off"
          name="search"
          label="Search"
          id="search"
          sx={{
            mr: 1,
            width: "16rem",
          }}
          value={searchBar}
          onChange={(e) => setSearchBar(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" size="small">
                  <SearchIcon onClick={handleSearch} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {numSelected > 0 ? (
        <Box sx={{ display: "flex" }}>
          <Tooltip title="Rooms">
            <IconButton onClick={onOpenModal}>
              <MeetingRoomIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeleteScores(selected)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Tooltip title="Upload File" arrow>
          <IconButton component="label">
            <DriveFolderUploadIcon />
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.docm"
              onChange={handleUploadScore}
              multiple
            />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const SortableSelectedListItem = ({ id, index, setSelected }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    opacity: isDragging ? 0.7 : 1,
    userSelect: "none",
  };

  return (
    <ListItem ref={setNodeRef} style={style} divider>
      <ListItemText
        {...attributes}
        {...listeners}
        primary={`${index + 1}) ${id}`}
      />
      <IconButton
        edge="end"
        size="small"
        aria-label="remove"
        onClick={(e) => {
          e.stopPropagation();
          setSelected((prev) => prev.filter((k) => k !== id));
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </ListItem>
  );
};

const Scores = () => {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("dateCreated");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [roomNameOpen, setRoomNameOpen] = useState(false);
  const [createRooms, createRoomsStatus] = useCreateRoomMutation();
  const [deleteScores, deleteScoresStatus] = useDeleteScoreMutation();
  const notify = useNotify();
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadScore, uploadScoreStatus] = useLazyUploadScoreQuery();
  const [convertScore, convertScoreStatus] = useConvertScoreMutation();
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState, reset, watch } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: { roomName: "" },
  });
  const { data: roomsData, refetch: refetchRooms } = useGetAllRoomsQuery();

  useEffect(() => {
    refetchRooms?.();
  }, [openModal, refetchRooms]);

  const roomNameOptions = useMemo(
    () => roomsData?.rooms?.map((room) => room.roomName) ?? [],
    [roomsData],
  );
  const roomNameValue = watch("roomName");
  const roomNameExists = useMemo(() => {
    const name = (roomNameValue || "").trim();
    if (!name) return false;
    return roomNameOptions.includes(name);
  }, [roomNameOptions, roomNameValue]);

  useEffect(() => {
    if (openModal && selected.length === 0) {
      setOpenModal(false);
    }
  }, [openModal, selected]);

  const getAllScores = useGetAllScoresQuery({ search: searchQuery });

  const allScores =
    getAllScores?.data?.scores?.map((score) => {
      const sg = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .format(new Date(score.createdAt))
        .replaceAll(",", "");
      return createData(score.scoreName, score.scoreName, score.fullName, sg);
    }) || [];

  const handleUploadScore = async (event) => {
    try {
      setIsLoading(true);
      const allowedExtensions = ["pdf", "docx", "doc", "docm"];
      const maxBytes = 2 * 1024 * 1024;
      const totalFiles = event.target.files?.length || 0;
      let uploadedCount = 0;

      for (const file of event.target.files) {
        const ext = file.name.split(".").pop();
        if (!ext || !allowedExtensions.includes(ext)) {
          notify("error", "Only PDF and Word documents are allowed");
          continue;
        }

        if (file.size > maxBytes) {
          notify("error", `"${file.name}" exceeds the 2MB limit`);
          continue;
        }

        const scoreName = encodeURIComponent(file.name);
        const { uploadURL } = await uploadScore({ scoreName }).unwrap();

        await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });
        await convertScore({ Key: scoreName }).unwrap();
        await getAllScores.refetch();
        uploadedCount += 1;
        notify(
          "success",
          `File "${file.name}" uploaded successfully (${uploadedCount}/${totalFiles})`,
        );
      }
    } catch (err) {
      if (!err?.data) {
        notify("error", "No server response");
      } else {
        notify("error", err?.data?.message || "Error uploading score(s)");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScores = async (scoreNames) => {
    setIsLoading(true);
    const total = scoreNames.length;
    let deletedCount = 0;
    for (const scoreName of scoreNames) {
      try {
        const encodedName = encodeURIComponent(scoreName);
        await deleteScores(encodedName).unwrap();
        deletedCount += 1;
        notify(
          "success",
          `Score "${scoreName}" deleted successfully (${deletedCount}/${total})`,
        );
      } catch (err) {
        if (!err?.data) {
          notify("error", "No server response");
          break;
        } else {
          notify(
            "error",
            err?.data?.message || `Error deleting score "${scoreName}"`,
          );
        }
      }
    }
    try {
      await getAllScores.refetch();
    } catch (err) {
      notify("error", "Error refreshing scores after deletion");
    }
    setSelected([]);
    setIsLoading(false);
  };

  const handleSubmitModal = async (roomName, selected) => {
    try {
      setIsLoading(true);
      await createRooms({ roomName, scores: selected }).unwrap();
      await refetchRooms?.();
      setOpenModal(false);
      reset({ roomName: "" });
      notify(
        "success",
        roomNameExists
          ? "Room updated successfully"
          : `Room '${roomName}' created successfully`,
      );
    } catch (err) {
      if (!err?.data) {
        notify("error", "No server response");
      } else {
        notify("error", err?.data?.message || "Error creating room");
      }
    } finally {
      setIsLoading(false);
      setSelected([]);
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = allScores.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - allScores.length) : 0;

  const visibleRows = useMemo(
    () =>
      [...allScores]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, allScores],
  );

  const handleSelectedDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSelected((items) => {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Box sx={{ width: "100%" }}>
      {getAllScores.isLoading && <Loading />}
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          selected={selected}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          getAllScores={getAllScores}
          onOpenModal={() => setOpenModal(true)}
          handleUploadScore={handleUploadScore}
          handleDeleteScores={handleDeleteScores}
        />
        <Divider />

        <TableContainer>
          <Table
            sx={{ minWidth: 600 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={allScores.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          "aria-labelledby": labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ width: "10rem" }}
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.scoreName}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "10rem" }}>
                      {row.fullName}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "10rem" }}>
                      {row.dateCreated}
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10]}
          component="div"
          count={allScores.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={false}
        />
      </Paper>

      <Modal
        openModal={openModal}
        onClose={() => setOpenModal(false)}
        title="Enter Room Name:"
      >
        <Box
          component="form"
          onSubmit={handleSubmit(({ roomName }) =>
            handleSubmitModal(roomName, selected),
          )}
        >
          <Stack
            spacing={2}
            sx={{
              mt: 2,
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Controller
              name="roomName"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  freeSolo
                  options={roomNameOptions}
                  value={field.value || ""}
                  onChange={(_, newValue) => {
                    const next = newValue || "";
                    field.onChange(next);
                    setRoomNameOpen(next.trim().length > 0);
                  }}
                  onInputChange={(_, newValue) => {
                    const next = newValue || "";
                    field.onChange(next);
                    setRoomNameOpen(next.trim().length > 0);
                  }}
                  open={roomNameOpen}
                  onOpen={() => setRoomNameOpen(true)}
                  onClose={() => setRoomNameOpen(false)}
                  openOnFocus={true}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      fullWidth
                      label="Room Name"
                      onBlur={field.onBlur}
                      error={!!formState.errors.roomName}
                      helperText={formState.errors.roomName?.message}
                      sx={{
                        "& .MuiInputBase-root": {
                          backgroundColor: "secondary.main",
                        },
                        "& .MuiFormHelperText-root": {
                          padding: 0,
                          margin: 0,
                        },
                        "& .MuiAutocomplete-clearIndicator": {
                          display: "none",
                        },
                      }}
                    />
                  )}
                />
              )}
            />

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleSelectedDragEnd}
            >
              <SortableContext
                items={selected}
                strategy={verticalListSortingStrategy}
              >
                <List>
                  {selected.map((score, index) => (
                    <SortableSelectedListItem
                      key={score}
                      id={score}
                      index={index}
                      setSelected={setSelected}
                    />
                  ))}
                </List>
              </SortableContext>
            </DndContext>

            <Box
              sx={{ display: "flex", justifyContent: "center", width: "100%" }}
            >
              <Button
                variant="contained"
                size="large"
                type="submit"
                disabled={!formState.isValid}
              >
                {roomNameExists ? "Update Room" : "Create Room"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default Scores;
