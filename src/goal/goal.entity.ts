import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity'; // Cesta k User entitě
@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  goal_name: string;

  @Column()
  reason: string;

  @Column()
  destination: string;

  @Column()
  new_self: string;

  @Column()
  daily_action: string;

  @Column()
  daily_learning: string;

  @Column()
  daily_visualization: string;

  @Column('int')
  duration: number;

  @ManyToOne(() => User, (user) => user.goals, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
