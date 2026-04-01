import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  TextField,
  MenuItem,
  Pagination,
  Alert,
  Divider,
} from "@mui/material";
import { Announcement as AnnouncementIcon } from "@mui/icons-material";
import announcementAPI from "../../apis/announcementAPI";

const EmployeeAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    page: 1,
    limit: 6,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 1,
  });

  useEffect(() => {
    fetchMyAnnouncements();
  }, [filters]);

  const fetchMyAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementAPI.getMyAnnouncements(filters);
      setAnnouncements(response.data.announcements);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (event, value) => {
    setFilters(prev => ({ ...prev, page: value }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      Urgent: "error",
      Holiday: "success",
      Meeting: "info",
      Training: "warning",
      Policy: "primary",
    };
    return colors[category] || "default";
  };

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <AnnouncementIcon color="primary" />
            <Typography variant="h5" component="h1">
              Announcements
            </Typography>
          </Box>
          <Typography color="textSecondary">
            View announcements that you have created
          </Typography>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter by Category"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Holiday">Holiday</MenuItem>
                <MenuItem value="Meeting">Meeting</MenuItem>
                <MenuItem value="Policy">Policy</MenuItem>
                <MenuItem value="Training">Training</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={8} sx={{ textAlign: "right" }}>
              <Typography variant="body2" color="textSecondary">
                Showing {announcements.length} of {pagination.total} announcements
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Announcements Grid */}
      {announcements.length === 0 ? (
        <Alert severity="info">
          No announcements found matching your criteria.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} md={6} key={announcement._id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {announcement.title}
                    </Typography>
                    <Chip
                      label={announcement.category || "General"}
                      color={getCategoryColor(announcement.category)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {announcement.message}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="textSecondary">
                      By: {announcement.createdBy?.name?.first} {announcement.createdBy?.name?.last}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default EmployeeAnnouncements;