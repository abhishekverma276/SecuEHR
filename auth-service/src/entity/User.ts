import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;
  
  @Column()
  passwordHash: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  totpSecret: string;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry?: Date;
  
  @CreateDateColumn()
  createdAt: Date;
}