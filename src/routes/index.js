import userRoutes from './users';

export function initRoutes(app) {
  app.use('/users', userRoutes);
}