import { useMemo, useState } from "react";
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
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
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
import Popper from "../../components/Popper/Popper";
import { useNotify } from "../../hooks/useNotify";
import { useDeleteRoomMutation } from "../../redux/apis/rooms/deleteRooms";
import { useGetAllRoomsQuery } from "../../redux/apis/rooms/getAllRooms";
import { useUpdateRoomMutation } from "../../redux/apis/rooms/updateRoom";
import { roomSchema } from "./helpers";

const createData = (id, roomName, scores, dateCreated) => {
  return {
    id,
    roomName,
    scores,
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
    id: "roomName",
    numeric: false,
    disablePadding: true,
    label: "Room Name",
  },
  {
    id: "scores",
    numeric: false,
    disablePadding: true,
    label: "Scores",
  },
  {
    id: "dateCreated",
    numeric: false,
    disablePadding: false,
    label: "Date Created",
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

const EnhancedTableToolbar = (props) => {
  const notify = useNotify();
  const { selected, searchQuery, setSearchQuery, handleDeleteRooms } = props;
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
          value={searchBar}
          onChange={(e) => setSearchBar(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            mr: 1,
            width: "16rem",
          }}
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
      {numSelected > 0 && (
        <Box sx={{ display: "flex" }}>
          <Tooltip title="Delete">
            <IconButton>
              <DeleteIcon onClick={() => handleDeleteRooms(selected)} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const SortableScoreKeyItem = ({
  id,
  index,
  rowScores,
  setRowScores,
  setRowScoreOrder,
}) => {
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
          setRowScores((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
          });
          setRowScoreOrder((prev) => prev.filter((key) => key !== id));
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </ListItem>
  );
};

const RoomTable = () => {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("dateCreated");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const notify = useNotify();
  const [searchQuery, setSearchQuery] = useState("");
  const [popperOpen, setPopperOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [roomOrders, setRoomOrders] = useState({}); // track preferred score order per room

  const [rowScores, setRowScores] = useState(null);
  const [rowScoreOrder, setRowScoreOrder] = useState([]);
  const [deleteRooms, deleteRoomsStatus] = useDeleteRoomMutation();
  const [updateRoom, updateRoomStatus] = useUpdateRoomMutation();

  const { control, handleSubmit, formState, reset } = useForm({
    resolver: yupResolver(roomSchema),
    mode: "all",
    defaultValues: { roomName: "" },
  });

  const getAllRooms = useGetAllRoomsQuery(
    { search: searchQuery },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const allRooms =
    getAllRooms?.data?.rooms?.map((room) => {
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
        .format(new Date(room.createdAt))
        .replaceAll(",", "");

      return createData(room.roomName, room.roomName, room.scores, sg);
    }) || [];

  const handleClickLink = (event, row) => {
    event.stopPropagation();
  };

  const handleMouseEnter = (event, row) => {
    setAnchorEl(event.currentTarget);
    const orderedKeys =
      roomOrders[row.roomName] || Object.keys(row.scores || {});
    // keep only keys that still exist in scores
    const filteredOrder = orderedKeys.filter((k) => k in (row.scores || {}));
    setCurrentRow({ order: filteredOrder, scores: row.scores || {} });
    setPopperOpen(true);
  };

  const handleMouseLeave = () => {
    setPopperOpen(false);
    setAnchorEl(null);
    setPopperOpen(false);
  };

  const handleOpenModal = (event, row) => {
    event.stopPropagation();

    const scoresObj = row.scores || {};
    const presetOrder = roomOrders[row.roomName] || Object.keys(scoresObj);
    const filteredOrder = presetOrder.filter((k) => k in scoresObj);
    setRowScores(scoresObj);
    setRowScoreOrder(filteredOrder);
    setCurrentRoomName(row.roomName);
    reset({ roomName: row.roomName });
    setOpenModal(true);
  };

  const handleRowScoresDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setRowScoreOrder((items) => {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleSubmitModal = async (roomName, scoresObj) => {
    const orderedScoresObj = Object.fromEntries(
      rowScoreOrder.map((k) => [k, scoresObj?.[k]]),
    );

    try {
      setIsLoading(true);
      await updateRoom({
        roomName: currentRoomName,
        body: { roomName, scores: orderedScoresObj },
      }).unwrap();
      await getAllRooms.refetch();
      setRoomOrders((prev) => {
        const next = { ...prev };
        if (currentRoomName && currentRoomName !== roomName) {
          delete next[currentRoomName];
        }
        next[roomName] = [...rowScoreOrder];
        return next;
      });
      notify("success", "Room updated successfully");
      setOpenModal(false);
      setSelected([]);
    } catch (err) {
      if (!err?.data) {
        notify("error", "No server response");
      } else {
        notify("error", err?.data?.message || "Error updating room");
      }
    }
    setIsLoading(false);
  };

  const handleDeleteRooms = async (roomNames) => {
    setIsLoading(true);
    const total = roomNames.length;
    let deletedCount = 0;
    for (const roomName of roomNames) {
      try {
        const encodedName = encodeURIComponent(roomName);
        await deleteRooms(encodedName).unwrap();
        deletedCount += 1;
        notify(
          "success",
          `Room '${roomName}' deleted successfully (${deletedCount}/${total})`,
        );
      } catch (err) {
        if (!err?.data) {
          notify("error", "No server response");
          break;
        } else {
          notify(
            "error",
            err?.data?.message || `Error deleting room '${roomName}'`,
          );
        }
      }
    }
    try {
      await getAllRooms.refetch();
    } catch (err) {
      notify("error", "Failed to refresh rooms after deletion");
    }
    setSelected([]);
    setIsLoading(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = allRooms.map((n) => n.id);
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
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - allRooms.length) : 0;

  const visibleRows = useMemo(
    () =>
      [...allRooms]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, allRooms],
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Box sx={{ width: "100%" }}>
      {getAllRooms.isLoading && <Loading />}
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          selected={selected}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleDeleteRooms={handleDeleteRooms}
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
              rowCount={allRooms.length}
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
                      <Link
                        href={`/rooms/${row.roomName}`}
                        color="#0000ff"
                        underline="hover"
                        onClick={(event) => handleClickLink(event, row)}
                        sx={{ fontWeight: "500" }}
                      >
                        {row.roomName}
                      </Link>
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ width: "10rem" }}
                      onMouseEnter={(event) => handleMouseEnter(event, row)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link
                        color="#0000ff"
                        underline="hover"
                        onClick={(event) => handleOpenModal(event, row)}
                        sx={{ fontWeight: "500" }}
                      >
                        {Object.keys(row.scores || {}).length}
                      </Link>
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
          count={allRooms.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={false}
        />
      </Paper>

      {currentRow && (currentRow.order?.length || 0) > 0 && (
        <Popper open={popperOpen} anchorEl={anchorEl}>
          {(currentRow.order || []).map((scoreKey, index) => (
            <Box key={scoreKey}>{`${index + 1}) ${scoreKey}`}</Box>
          ))}
        </Popper>
      )}

      <Modal
        openModal={openModal}
        onClose={() => setOpenModal(false)}
        title="Update Room"
      >
        <Box
          component="form"
          onSubmit={handleSubmit(({ roomName }) =>
            handleSubmitModal(roomName, rowScores),
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
                <TextField
                  {...field}
                  variant="outlined"
                  size="small"
                  fullWidth
                  label="Room Name"
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
                  }}
                />
              )}
            />

            {/* ✅ replaced list with draggable sortable list */}
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleRowScoresDragEnd}
            >
              <SortableContext
                items={rowScoreOrder}
                strategy={verticalListSortingStrategy}
              >
                <List>
                  {rowScoreOrder.map((scoreKey, index) => (
                    <SortableScoreKeyItem
                      key={scoreKey}
                      id={scoreKey}
                      index={index}
                      rowScores={rowScores}
                      setRowScores={setRowScores}
                      setRowScoreOrder={setRowScoreOrder}
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
                disabled={!formState.isValid || updateRoomStatus?.isLoading}
              >
                Update Room
              </Button>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default RoomTable;
