import mongoose, {
  Schema,
  Document,
  ObjectId,
  Types,
  SchemaTypes,
} from "mongoose";

export interface UserInput {
  email: string;
  firstName: string;
  lastName: string;
  friends?: ObjectId[];
  inboundFriendRequests?: ObjectId[];
  outboundFriendRequests?: ObjectId[];
  googleId?: string;
  thumbnail?: string;
  password?: string;
}

export interface UserDocument extends UserInput, Document {
  email: string;
  firstName: string;
  lastName: string;
  friends: ObjectId[];
  inboundFriendRequests: ObjectId[];
  outboundFriendRequests: ObjectId[];
  googleId: string;
  thumbnail: string;
  password: string;
}

const UserSchema = new Schema<UserDocument>({
  email: { type: Schema.Types.String, required: true },
  firstName: { type: Schema.Types.String, required: true },
  lastName: { type: Schema.Types.String, required: true },
  friends: { type: [Schema.Types.ObjectId], default: [] },
  inboundFriendRequests: { type: [Schema.Types.ObjectId], default: [] },
  outboundFriendRequests: { type: [Schema.Types.ObjectId], default: [] },
  googleId: { type: Schema.Types.String },
  thumbnail: { type: Schema.Types.String },
  password: { type: Schema.Types.String, required: true },
});

export default mongoose.model("User", UserSchema);
