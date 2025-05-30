import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { loginSchema, registerSchema } from '@shared/schema';
import { AuthenticatedRequest } from '../middleware/auth';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(validatedData.password as string, saltRounds);

      // Determine role - special handling for admin user
      let userRole = "standard";
      if (validatedData.email === "dev@adminlocal.com") {
        userRole = "admin";
      } else if (validatedData.role === "pro") {
        userRole = "pro";
      }

      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        role: userRole,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        onboardingComplete: false,
        voiceEnabled: true,
        ttsEnabled: true
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({ 
        message: 'User created successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid input data', details: error.message });
      }
      res.status(500).json({ error: 'Failed to create user' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Use passport login
      req.login(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: 'Login failed' });
        }

        const { password, ...userWithoutPassword } = user;
        res.json({ 
          message: 'Login successful',
          user: userWithoutPassword
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid input data' });
      }
      res.status(500).json({ error: 'Login failed' });
    }
  },

  async logout(req: Request, res: Response) {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  },

  async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { password, ...userWithoutPassword } = req.user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user information' });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const allowedUpdates = ['firstName', 'lastName', 'voiceEnabled', 'ttsEnabled'];
      const updates: any = {};
      
      for (const field of allowedUpdates) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const updatedUser = await storage.updateUser(req.user.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ 
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  async completeOnboarding(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { role, preferences } = req.body;
      
      // Update user onboarding status and role if provided
      const updates: any = { onboardingComplete: true };
      if (role && ['standard', 'pro', 'admin'].includes(role)) {
        updates.role = role;
      }

      const updatedUser = await storage.updateUser(req.user.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Save user preferences if provided
      if (preferences) {
        await storage.updateUserPreferences(req.user.id, preferences);
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ 
        message: 'Onboarding completed successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Complete onboarding error:', error);
      res.status(500).json({ error: 'Failed to complete onboarding' });
    }
  }
};
