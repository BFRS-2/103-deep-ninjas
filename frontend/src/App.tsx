import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  ThemeProvider,
  createTheme,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Backdrop,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Fade,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2962ff',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
});

const Logo = styled('img')({
  height: '40px',
  marginRight: '10px',
});

const StyledPaper = styled(Paper)({
  padding: '2rem',
  marginTop: '2rem',
  borderRadius: '16px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
});

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface FormData {
  website_url: string;
  productImages: string[];
  additional_input: string;
}

interface AdVariation {
  heading: string;
  "primary text": string;
  call_to_action: string;
  hashtags: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    website_url: '',
    productImages: [],
    additional_input: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [adVariations, setAdVariations] = useState<AdVariation[]>([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('/pickrr/seller/file/upload/', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error(`Image upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        productImages: [...prev.productImages, data.url],
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again. Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = 
      await fetch('https://ef45-3-111-202-221.ngrok-free.app/generate-ad-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ad copy');
      }

      const data = await response.json();
      //  const data = response; 
      setAdVariations(data);
      console.log('Generated ad copy:', data);
    } catch (error) {
      console.error('Error generating ad copy:', error);
      alert('Failed to generate ad copy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Logo
              src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fmontgomerysummit.com%2Fcompanies%2Fshiprocket%2F&psig=AOvVaw3VJ3BJtIEFe1oMvOUtZhQz&ust=1750491348044000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCNCJi8q-_40DFQAAAAAdAAAAABAE"
              alt="Shiprocket Logo"
            />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Ads Generation Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <StyledPaper elevation={3}>
            <Typography variant="h4" gutterBottom align="center" color="primary">
              Generate Ads
            </Typography>
            <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
              Enter website details and upload product images to generate customized advertisements
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
              <TextField
                fullWidth
                label="Website URL"
                variant="outlined"
                value={formData.website_url}
                onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://example.com"
                sx={{ mb: 3 }}
              />

              <Box sx={{ mb: 3 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Product Image'}
                  <VisuallyHiddenInput 
                    type="file" 
                    onChange={handleImageUpload} 
                    accept="image/*"
                    disabled={isUploading}
                  />
                </Button>

                {isUploading && (
                  <Box sx={{ 
                    width: '100%', 
                    mt: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">
                      Uploading image...
                    </Typography>
                  </Box>
                )}

                <List>
                  {formData.productImages.map((image, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`Image ${index + 1}`} 
                        secondary={image} 
                        sx={{
                          wordBreak: 'break-all'
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => handleRemoveImage(index)}
                          disabled={isUploading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <TextField
                fullWidth
                label="Additional Input"
                variant="outlined"
                multiline
                rows={4}
                value={formData.additional_input}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_input: e.target.value }))}
                placeholder="Add any additional information (e.g., add something for diwali sale)"
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isLoading || isUploading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? 'Generating...' : 'Generate Ads'}
              </Button>
            </Box>
          </StyledPaper>

          {adVariations.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ mb: 4 }}>
                Generated Ad Variations
              </Typography>
              <Grid container spacing={3}>
                {adVariations.map((variation, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Fade in timeout={300 * (index + 1)}>
                      <Card>
                        <CardContent sx={{ position: 'relative' }}>
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              right: 8,
                              top: 8,
                            }}
                            onClick={() => copyToClipboard(
                              `${variation.heading}\n\n${variation["primary text"]}\n\n${variation.call_to_action}\n\n${variation.hashtags}`
                            )}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                          <Typography variant="h6" gutterBottom color="primary" style={{maxWidth: "80%"}}>
                            {variation.heading}
                          </Typography>
                          <Typography variant="body1" paragraph>
                            {variation["primary text"]}
                          </Typography>
                          <Typography variant="button" display="block" color="secondary" gutterBottom>
                            {variation.call_to_action}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {variation.hashtags.split(' ').map((tag, i) => (
                              <Chip
                                key={i}
                                label={tag}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>

        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: 'column',
            gap: 2
          }}
          open={isLoading}
        >
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6">
            Generating Ads...
          </Typography>
          <Typography variant="body1" color="inherit">
            Please wait while we create your customized advertisements
          </Typography>
        </Backdrop>
      </Box>
    </ThemeProvider>
  );
}

export default App;
