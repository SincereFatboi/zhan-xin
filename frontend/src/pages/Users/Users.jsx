import { useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
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
import { useDeleteUserMutation } from "../../redux/apis/users/deleteUser";
import { useGetAllUsersQuery } from "../../redux/apis/users/getAllUsers";
import { useUpdateUserMutation } from "../../redux/apis/users/updateUser";
import { userSchema } from "./helpers";

const STATUS_OPTIONS = ["PENDING", "ACTIVE", "INACTIVE"];
const ROLE_OPTIONS = ["MEMBER", "ADMIN", "SUPER_ADMIN"];

const createData = (
  id,
  username,
  firstName,
  lastName,
  status,
  role,
  createdAt,
) => {
  return {
    id,
    username,
    firstName,
    lastName,
    status,
    role,
    createdAt,
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
  { id: "username", numeric: false, disablePadding: true, label: "Username" },
  {
    id: "firstName",
    numeric: false,
    disablePadding: true,
    label: "First Name",
  },
  { id: "lastName", numeric: false, disablePadding: true, label: "Last Name" },
  { id: "status", numeric: false, disablePadding: true, label: "Status" },
  { id: "role", numeric: false, disablePadding: true, label: "Role" },
  {
    id: "createdAt",
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
            // align={"left"}
            // padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ whiteSpace: "nowrap" }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
              // sx={{ mr: "-22px" }}
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
  searchQuery,
  setSearchQuery,
  selected,
  handleDeleteUsers,
}) => {
  const numSelected = selected.length;
  const [searchBar, setSearchBar] = useState(searchQuery);

  const handleSearch = () => {
    setSearchQuery(searchBar);
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
          sx={{ mr: 1, width: "16rem" }}
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
      {numSelected > 0 && (
        <Box sx={{ display: "flex" }}>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeleteUsers(selected)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  searchQuery: PropTypes.string,
  setSearchQuery: PropTypes.func.isRequired,
  selected: PropTypes.array.isRequired,
  handleDeleteUsers: PropTypes.func.isRequired,
};

const Users = () => {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [activeUser, setActiveUser] = useState({
    id: "",
    username: "",
    firstName: "",
    lastName: "",
    status: "",
    role: "",
  });
  const [deleteUser, deleteStatus] = useDeleteUserMutation();
  const [updateUser, updateStatus] = useUpdateUserMutation();
  const notify = useNotify();

  const { control, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(userSchema),
    mode: "all",
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
    },
  });

  const usersQuery = useGetAllUsersQuery({ search: searchQuery });

  const allUsers =
    usersQuery?.data?.users?.map((user) => {
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
        .format(new Date(user.createdAt))
        .replaceAll(",", "");

      return createData(
        user.id,
        user.username,
        user.firstName,
        user.lastName,
        user.status,
        user.role,
        sg,
      );
    }) || [];

  const filteredUsers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return allUsers;
    return allUsers.filter((user) =>
      [user.username, user.firstName, user.lastName]
        .map((val) => (val || "").toLowerCase())
        .some((val) => val.includes(term)),
    );
  }, [allUsers, searchQuery]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredUsers.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    event.stopPropagation();
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

  const handleDeleteUsers = async (userIds) => {
    setIsLoading(true);
    const total = userIds.length;
    let deletedCount = 0;
    for (const userId of userIds) {
      try {
        const encodedName = encodeURIComponent(userId);
        await deleteUser(encodedName).unwrap();
        const displayName =
          filteredUsers.find((u) => u.id === userId)?.username || userId;
        deletedCount += 1;
        notify(
          "success",
          `User '${displayName}' deleted successfully (${deletedCount}/${total})`,
        );
      } catch (err) {
        if (!err?.data) {
          notify("error", "No server response");
        } else {
          const displayName =
            filteredUsers.find((u) => u.id === userId)?.username || userId;
          notify(
            "error",
            err?.data?.message || `Error deleting user '${displayName}'`,
          );
        }
      }
      try {
        await usersQuery.refetch();
      } catch (err) {
        notify("error", "Failed to refresh users after deletion");
      }
      setSelected([]);
      setIsLoading(false);
    }
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredUsers.length) : 0;

  const visibleRows = useMemo(
    () =>
      [...filteredUsers]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredUsers],
  );

  const handleOpenModal = (event, user) => {
    event.stopPropagation();
    setActiveUser({
      id: user.id || "",
      username: user.username || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      status: user.status || "",
      role: user.role || "",
    });
    reset({
      username: user.username || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleUpdateUser = async ({ username, firstName, lastName }) => {
    if (!activeUser.id) return;
    setIsLoading(true);
    try {
      await updateUser({
        userId: activeUser.id,
        payload: {
          username,
          firstName,
          lastName,
          status: activeUser.status,
          role: activeUser.role,
        },
      }).unwrap();
      notify("success", "User updated successfully");
    } catch (err) {
      if (!err?.data) {
        notify("error", "No server response");
      } else if (err?.data) {
        notify("error", err?.data?.message || "Error updating user");
      }
    }
    try {
      await usersQuery.refetch();
    } catch (err) {
      notify("error", "Error refreshing users after update");
    }
    setOpenModal(false);
    setIsLoading(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Box sx={{ width: "100%" }}>
      {usersQuery.isLoading && <Loading />}

      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selected={selected}
          handleDeleteUsers={handleDeleteUsers}
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
              rowCount={filteredUsers.length}
            />

            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: "pointer" }}
                    onClick={(event) => handleOpenModal(event, row)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                        onClick={(event) => handleClick(event, row.id)}
                      />
                    </TableCell>

                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      sx={{ width: "20%" }}
                    >
                      {row.username}
                    </TableCell>

                    <TableCell>{row.firstName}</TableCell>

                    <TableCell>{row.lastName}</TableCell>

                    <TableCell>{row.status}</TableCell>

                    <TableCell>{row.role}</TableCell>

                    <TableCell>{row.createdAt}</TableCell>
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
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={false}
        />
      </Paper>

      <Modal
        openModal={openModal}
        onClose={handleCloseModal}
        title="User Details"
      >
        <Box component="form" onSubmit={handleSubmit(handleUpdateUser)}>
          <Stack spacing={2} sx={{ mt: 2, width: "100%" }}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  size="small"
                  fullWidth
                  error={!!formState.errors.username}
                  helperText={formState.errors.username?.message}
                  sx={{
                    "& .MuiFormHelperText-root": {
                      padding: 0,
                      margin: 0,
                    },
                  }}
                />
              )}
            />
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  size="small"
                  fullWidth
                  error={!!formState.errors.firstName}
                  helperText={formState.errors.firstName?.message}
                  sx={{
                    "& .MuiFormHelperText-root": {
                      padding: 0,
                      margin: 0,
                    },
                  }}
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  size="small"
                  fullWidth
                  error={!!formState.errors.lastName}
                  helperText={formState.errors.lastName?.message}
                />
              )}
            />
            <TextField
              label="Status"
              value={activeUser.status}
              onChange={(event) =>
                setActiveUser((prev) => ({
                  ...prev,
                  status: event.target.value,
                }))
              }
              select
              size="small"
              fullWidth
              SelectProps={{ native: false }}
              sx={{
                "& .MuiFormHelperText-root": {
                  padding: 0,
                  margin: 0,
                },
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Role"
              value={activeUser.role}
              onChange={(event) =>
                setActiveUser((prev) => ({
                  ...prev,
                  role: event.target.value,
                }))
              }
              select
              size="small"
              fullWidth
              SelectProps={{ native: false }}
              sx={{
                "& .MuiFormHelperText-root": {
                  padding: 0,
                  margin: 0,
                },
              }}
            >
              {ROLE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <Button
                variant="contained"
                type="submit"
                disabled={updateStatus.isLoading || !formState.isValid}
              >
                Update User
              </Button>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default Users;
